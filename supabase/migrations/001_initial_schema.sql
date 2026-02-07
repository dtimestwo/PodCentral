-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE CONTENT TABLES
-- ============================================

-- Categories (static lookup table)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcasts
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_index_id BIGINT UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  locked BOOLEAN DEFAULT FALSE,
  medium TEXT DEFAULT 'podcast' CHECK (medium IN ('podcast', 'music', 'video', 'audiobook')),
  language TEXT DEFAULT 'en',
  episode_count INTEGER DEFAULT 0,
  license TEXT,
  location TEXT,
  feed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_podcasts_podcast_index_id ON podcasts(podcast_index_id);
CREATE INDEX idx_podcasts_categories ON podcasts USING GIN(categories);

-- Podcast Funding
CREATE TABLE podcast_funding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_podcast_funding_podcast_id ON podcast_funding(podcast_id);

-- Value Configs (for podcasts or episodes)
CREATE TABLE value_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  episode_id UUID, -- Will reference episodes once created
  type TEXT DEFAULT 'lightning',
  method TEXT DEFAULT 'keysend',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (podcast_id IS NOT NULL OR episode_id IS NOT NULL)
);

CREATE INDEX idx_value_configs_podcast_id ON value_configs(podcast_id);

-- Value Recipients
CREATE TABLE value_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value_config_id UUID NOT NULL REFERENCES value_configs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wallet', 'host', 'guest', 'app')),
  address TEXT NOT NULL,
  split INTEGER NOT NULL CHECK (split >= 0 AND split <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_value_recipients_config_id ON value_recipients(value_config_id);

-- Persons (hosts, guests, etc.)
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'guest', 'editor', 'producer')),
  group_name TEXT,
  img TEXT NOT NULL,
  href TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  podcast_index_id BIGINT UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_published TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  enclosure_url TEXT NOT NULL,
  image TEXT,
  season INTEGER,
  episode INTEGER,
  is_trailer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX idx_episodes_date_published ON episodes(date_published DESC);
CREATE INDEX idx_episodes_podcast_index_id ON episodes(podcast_index_id);

-- Add episode_id foreign key to value_configs
ALTER TABLE value_configs
ADD CONSTRAINT fk_value_configs_episode_id
FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE;

CREATE INDEX idx_value_configs_episode_id ON value_configs(episode_id);

-- Episode Persons (junction table)
CREATE TABLE episode_persons (
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (episode_id, person_id)
);

CREATE INDEX idx_episode_persons_person_id ON episode_persons(person_id);

-- Social Interact links
CREATE TABLE social_interact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  uri TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('activitypub', 'twitter', 'nostr')),
  account_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_interact_episode_id ON social_interact(episode_id);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  title TEXT NOT NULL,
  img TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chapters_episode_id ON chapters(episode_id);
CREATE INDEX idx_chapters_start_time ON chapters(episode_id, start_time);

-- Transcript Segments
CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transcript_segments_episode_id ON transcript_segments(episode_id);
CREATE INDEX idx_transcript_segments_time ON transcript_segments(episode_id, start_time);

-- Soundbites
CREATE TABLE soundbites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  start_time INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soundbites_episode_id ON soundbites(episode_id);

-- Live Streams
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('live', 'scheduled', 'ended')),
  start_time TIMESTAMPTZ NOT NULL,
  listener_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_streams_podcast_id ON live_streams(podcast_id);
CREATE INDEX idx_live_streams_status ON live_streams(status);

-- ============================================
-- USER TABLES
-- ============================================

-- User Profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, podcast_id)
);

CREATE INDEX idx_user_subscriptions_podcast_id ON user_subscriptions(podcast_id);

-- Listening History
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  last_played TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, episode_id)
);

CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_last_played ON listening_history(user_id, last_played DESC);

-- User Wallets
CREATE TABLE user_wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 50000,
  streaming_rate INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('boost', 'stream', 'topup')),
  amount INTEGER NOT NULL,
  recipient TEXT,
  message TEXT,
  episode_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(user_id, created_at DESC);

-- Comments (self-referencing for replies)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  text TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('mastodon', 'fountain', 'podcastindex', 'nostr')),
  boost_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_episode_id ON comments(episode_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Chat Messages (for live streams)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  is_boost BOOLEAN DEFAULT FALSE,
  boost_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_live_stream_id ON chat_messages(live_stream_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(live_stream_id, created_at);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interact ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE soundbites ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (for content tables)
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON podcasts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON podcast_funding FOR SELECT USING (true);
CREATE POLICY "Public read access" ON value_configs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON value_recipients FOR SELECT USING (true);
CREATE POLICY "Public read access" ON persons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON episode_persons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON social_interact FOR SELECT USING (true);
CREATE POLICY "Public read access" ON chapters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON transcript_segments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON soundbites FOR SELECT USING (true);
CREATE POLICY "Public read access" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON chat_messages FOR SELECT USING (true);

-- USER PROFILE POLICIES
CREATE POLICY "Users can view any profile" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- USER SUBSCRIPTION POLICIES
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON user_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- LISTENING HISTORY POLICIES
CREATE POLICY "Users can view own history" ON listening_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON listening_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON listening_history FOR UPDATE USING (auth.uid() = user_id);

-- WALLET POLICIES
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON user_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WALLET TRANSACTION POLICIES
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COMMENT INSERT POLICY (authenticated users only)
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CHAT MESSAGE INSERT POLICY
CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, display_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'avatar_url');

    INSERT INTO user_wallets (user_id, balance, streaming_rate)
    VALUES (NEW.id, 50000, 100);

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
