-- Migration: Fix jsonb_array_length calls to handle non-array values
-- This fixes the "cannot get array length of a scalar" error

-- ============================================
-- HELPER FUNCTION FOR SAFE ARRAY LENGTH CHECK
-- ============================================

CREATE OR REPLACE FUNCTION safe_jsonb_array_length(p_value JSONB)
RETURNS INTEGER AS $$
BEGIN
  IF p_value IS NULL OR jsonb_typeof(p_value) != 'array' THEN
    RETURN 0;
  END IF;
  RETURN jsonb_array_length(p_value);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FIX HELPER RPC FUNCTIONS
-- ============================================

-- Atomic chapter sync: delete old and insert new in one transaction
CREATE OR REPLACE FUNCTION sync_episode_chapters(
  p_episode_id UUID,
  p_chapters JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Delete existing chapters for this episode
  DELETE FROM chapters WHERE episode_id = p_episode_id;

  -- Insert new chapters if provided (with safe array check)
  IF safe_jsonb_array_length(p_chapters) > 0 THEN
    INSERT INTO chapters (episode_id, start_time, end_time, title, img, url)
    SELECT
      p_episode_id,
      (ch->>'start_time')::INTEGER,
      NULLIF(ch->>'end_time', '')::INTEGER,
      ch->>'title',
      NULLIF(ch->>'img', ''),
      NULLIF(ch->>'url', '')
    FROM jsonb_array_elements(p_chapters) AS ch;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic transcript sync: delete old and insert new in one transaction
CREATE OR REPLACE FUNCTION sync_episode_transcript(
  p_episode_id UUID,
  p_segments JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Delete existing transcript segments for this episode
  DELETE FROM transcript_segments WHERE episode_id = p_episode_id;

  -- Insert new segments if provided (with safe array check)
  IF safe_jsonb_array_length(p_segments) > 0 THEN
    INSERT INTO transcript_segments (episode_id, start_time, end_time, speaker, text)
    SELECT
      p_episode_id,
      (seg->>'start_time')::INTEGER,
      (seg->>'end_time')::INTEGER,
      COALESCE(seg->>'speaker', ''),
      seg->>'text'
    FROM jsonb_array_elements(p_segments) AS seg;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic persons sync for an episode
CREATE OR REPLACE FUNCTION sync_episode_persons(
  p_episode_id UUID,
  p_persons JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_person JSONB;
  v_person_id UUID;
  v_count INTEGER := 0;
  v_role TEXT;
BEGIN
  -- Delete existing episode_persons links for this episode
  DELETE FROM episode_persons WHERE episode_id = p_episode_id;

  -- Safe array check
  IF safe_jsonb_array_length(p_persons) = 0 THEN
    RETURN 0;
  END IF;

  -- Process each person
  FOR v_person IN SELECT * FROM jsonb_array_elements(p_persons)
  LOOP
    -- Map role to valid enum value
    v_role := LOWER(v_person->>'role');
    IF v_role LIKE '%host%' THEN
      v_role := 'host';
    ELSIF v_role LIKE '%guest%' THEN
      v_role := 'guest';
    ELSIF v_role LIKE '%editor%' THEN
      v_role := 'editor';
    ELSIF v_role LIKE '%producer%' THEN
      v_role := 'producer';
    ELSE
      v_role := 'guest'; -- default
    END IF;

    -- Upsert person
    INSERT INTO persons (name, role, group_name, img, href)
    VALUES (
      v_person->>'name',
      v_role,
      NULLIF(v_person->>'group_name', ''),
      COALESCE(NULLIF(v_person->>'img', ''), 'https://i.pravatar.cc/150?u=' || encode(convert_to(v_person->>'name', 'UTF8'), 'base64')),
      NULLIF(v_person->>'href', '')
    )
    ON CONFLICT (name, role) DO UPDATE SET
      group_name = EXCLUDED.group_name,
      img = EXCLUDED.img,
      href = EXCLUDED.href
    RETURNING id INTO v_person_id;

    -- Link person to episode
    INSERT INTO episode_persons (episode_id, person_id)
    VALUES (p_episode_id, v_person_id)
    ON CONFLICT (episode_id, person_id) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX MAIN SYNC RPC FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION sync_podcast_from_api(
  p_podcast JSONB,
  p_episodes JSONB
) RETURNS TABLE(
  podcast_id UUID,
  episodes_created INTEGER,
  episodes_updated INTEGER
) AS $$
DECLARE
  v_podcast_id UUID;
  v_value_config_id UUID;
  v_episodes_created INTEGER := 0;
  v_episodes_updated INTEGER := 0;
  v_episode JSONB;
  v_episode_id UUID;
  v_existing_id UUID;
  v_soundbite JSONB;
  v_social JSONB;
BEGIN
  -- All operations in this function are in a single transaction

  -- 1. Upsert podcast
  INSERT INTO podcasts (
    podcast_index_id,
    title,
    author,
    description,
    image,
    categories,
    locked,
    medium,
    language,
    episode_count,
    feed_url
  )
  VALUES (
    (p_podcast->>'podcast_index_id')::BIGINT,
    p_podcast->>'title',
    p_podcast->>'author',
    p_podcast->>'description',
    p_podcast->>'image',
    CASE
      WHEN jsonb_typeof(p_podcast->'categories') = 'array' THEN
        COALESCE(
          (SELECT array_agg(cat) FROM jsonb_array_elements_text(p_podcast->'categories') AS cat),
          '{}'::TEXT[]
        )
      ELSE '{}'::TEXT[]
    END,
    COALESCE((p_podcast->>'locked')::BOOLEAN, FALSE),
    COALESCE(p_podcast->>'medium', 'podcast'),
    COALESCE(p_podcast->>'language', 'en'),
    COALESCE((p_podcast->>'episode_count')::INTEGER, 0),
    p_podcast->>'feed_url'
  )
  ON CONFLICT (podcast_index_id) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    categories = EXCLUDED.categories,
    locked = EXCLUDED.locked,
    language = EXCLUDED.language,
    episode_count = EXCLUDED.episode_count,
    feed_url = EXCLUDED.feed_url,
    updated_at = NOW()
  RETURNING id INTO v_podcast_id;

  -- 2. Upsert funding (if present)
  IF p_podcast->'funding' IS NOT NULL AND p_podcast->'funding'->>'url' IS NOT NULL THEN
    INSERT INTO podcast_funding (podcast_id, url, message)
    VALUES (
      v_podcast_id,
      p_podcast->'funding'->>'url',
      COALESCE(p_podcast->'funding'->>'message', '')
    )
    ON CONFLICT (podcast_id) DO UPDATE SET
      url = EXCLUDED.url,
      message = EXCLUDED.message;
  END IF;

  -- 3. Upsert value config and recipients atomically
  IF p_podcast->'value' IS NOT NULL AND p_podcast->'value'->'model' IS NOT NULL THEN
    -- Upsert value config
    INSERT INTO value_configs (podcast_id, type, method)
    VALUES (
      v_podcast_id,
      COALESCE(p_podcast->'value'->'model'->>'type', 'lightning'),
      COALESCE(p_podcast->'value'->'model'->>'method', 'keysend')
    )
    ON CONFLICT (podcast_id) WHERE episode_id IS NULL DO UPDATE SET
      type = EXCLUDED.type,
      method = EXCLUDED.method
    RETURNING id INTO v_value_config_id;

    -- Delete old recipients and insert new ones (atomic within transaction)
    DELETE FROM value_recipients WHERE value_config_id = v_value_config_id;

    IF jsonb_typeof(p_podcast->'value'->'destinations') = 'array' THEN
      INSERT INTO value_recipients (value_config_id, name, type, address, split)
      SELECT
        v_value_config_id,
        r->>'name',
        COALESCE(r->>'type', 'wallet'),
        r->>'address',
        COALESCE((r->>'split')::INTEGER, 0)
      FROM jsonb_array_elements(p_podcast->'value'->'destinations') AS r;
    END IF;
  END IF;

  -- 4. Process episodes (with safe array check)
  IF safe_jsonb_array_length(p_episodes) > 0 THEN
    FOR v_episode IN SELECT * FROM jsonb_array_elements(p_episodes)
    LOOP
      -- Check if episode exists
      SELECT id INTO v_existing_id FROM episodes
      WHERE podcast_index_id = (v_episode->>'podcast_index_id')::BIGINT;

      IF v_existing_id IS NOT NULL THEN
        -- Update existing episode
        UPDATE episodes SET
          title = v_episode->>'title',
          description = v_episode->>'description',
          date_published = (v_episode->>'date_published')::TIMESTAMPTZ,
          duration = COALESCE((v_episode->>'duration')::INTEGER, 0),
          enclosure_url = v_episode->>'enclosure_url',
          image = NULLIF(v_episode->>'image', ''),
          season = NULLIF(v_episode->>'season', '')::INTEGER,
          episode = NULLIF(v_episode->>'episode', '')::INTEGER,
          is_trailer = COALESCE((v_episode->>'is_trailer')::BOOLEAN, FALSE),
          updated_at = NOW()
        WHERE id = v_existing_id;

        v_episodes_updated := v_episodes_updated + 1;
        v_episode_id := v_existing_id;
      ELSE
        -- Insert new episode
        INSERT INTO episodes (
          podcast_id,
          podcast_index_id,
          title,
          description,
          date_published,
          duration,
          enclosure_url,
          image,
          season,
          episode,
          is_trailer
        )
        VALUES (
          v_podcast_id,
          (v_episode->>'podcast_index_id')::BIGINT,
          v_episode->>'title',
          v_episode->>'description',
          (v_episode->>'date_published')::TIMESTAMPTZ,
          COALESCE((v_episode->>'duration')::INTEGER, 0),
          v_episode->>'enclosure_url',
          NULLIF(v_episode->>'image', ''),
          NULLIF(v_episode->>'season', '')::INTEGER,
          NULLIF(v_episode->>'episode', '')::INTEGER,
          COALESCE((v_episode->>'is_trailer')::BOOLEAN, FALSE)
        )
        RETURNING id INTO v_episode_id;

        v_episodes_created := v_episodes_created + 1;
      END IF;

      -- Sync persons for this episode (only for new episodes, with safe array check)
      IF v_existing_id IS NULL AND safe_jsonb_array_length(v_episode->'persons') > 0 THEN
        PERFORM sync_episode_persons(v_episode_id, v_episode->'persons');
      END IF;

      -- Sync soundbites (only for new episodes)
      IF v_existing_id IS NULL THEN
        -- Handle soundbites array (with safe check)
        IF jsonb_typeof(v_episode->'soundbites') = 'array' THEN
          FOR v_soundbite IN SELECT * FROM jsonb_array_elements(v_episode->'soundbites')
          LOOP
            INSERT INTO soundbites (episode_id, start_time, duration, title)
            VALUES (
              v_episode_id,
              COALESCE((v_soundbite->>'start_time')::INTEGER, 0),
              COALESCE((v_soundbite->>'duration')::INTEGER, 0),
              COALESCE(v_soundbite->>'title', '')
            );
          END LOOP;
        -- Handle single soundbite
        ELSIF v_episode->'soundbite' IS NOT NULL AND jsonb_typeof(v_episode->'soundbite') = 'object' THEN
          INSERT INTO soundbites (episode_id, start_time, duration, title)
          VALUES (
            v_episode_id,
            COALESCE((v_episode->'soundbite'->>'start_time')::INTEGER, 0),
            COALESCE((v_episode->'soundbite'->>'duration')::INTEGER, 0),
            COALESCE(v_episode->'soundbite'->>'title', '')
          );
        END IF;

        -- Sync social interact (with safe check)
        IF jsonb_typeof(v_episode->'social_interact') = 'array' THEN
          FOR v_social IN SELECT * FROM jsonb_array_elements(v_episode->'social_interact')
          LOOP
            INSERT INTO social_interact (episode_id, uri, protocol, account_url)
            VALUES (
              v_episode_id,
              v_social->>'uri',
              COALESCE(v_social->>'protocol', 'activitypub'),
              NULLIF(v_social->>'account_url', '')
            );
          END LOOP;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- 5. Update podcast episode count
  UPDATE podcasts
  SET episode_count = (SELECT COUNT(*) FROM episodes WHERE episodes.podcast_id = v_podcast_id)
  WHERE id = v_podcast_id;

  RETURN QUERY SELECT v_podcast_id, v_episodes_created, v_episodes_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION safe_jsonb_array_length(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION sync_podcast_from_api(JSONB, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION sync_episode_chapters(UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION sync_episode_transcript(UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION sync_episode_persons(UUID, JSONB) TO service_role;
