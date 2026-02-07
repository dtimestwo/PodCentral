-- ============================================
-- SEED DATA
-- ============================================

-- Categories
INSERT INTO categories (id, name, icon) VALUES
  ('tech', 'Technology', 'Cpu'),
  ('comedy', 'Comedy', 'Laugh'),
  ('news', 'News', 'Newspaper'),
  ('science', 'Science', 'FlaskConical'),
  ('business', 'Business', 'Briefcase'),
  ('music', 'Music', 'Music'),
  ('health', 'Health & Fitness', 'Heart'),
  ('education', 'Education', 'GraduationCap'),
  ('society', 'Society & Culture', 'Globe'),
  ('sports', 'Sports', 'Trophy'),
  ('truecrime', 'True Crime', 'Search'),
  ('history', 'History', 'BookOpen');

-- Persons
INSERT INTO persons (id, name, role, img, href) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Adam Curry', 'host', 'https://i.pravatar.cc/150?u=adamcurry', 'https://curry.com'),
  ('00000000-0000-0000-0000-000000000002', 'Dave Jones', 'host', 'https://i.pravatar.cc/150?u=davejones', 'https://podcastindex.org'),
  ('00000000-0000-0000-0000-000000000003', 'Sarah Chen', 'host', 'https://i.pravatar.cc/150?u=sarachen', NULL),
  ('00000000-0000-0000-0000-000000000004', 'Marcus Johnson', 'host', 'https://i.pravatar.cc/150?u=marcusj', NULL),
  ('00000000-0000-0000-0000-000000000005', 'Elena Rodriguez', 'guest', 'https://i.pravatar.cc/150?u=elenar', NULL),
  ('00000000-0000-0000-0000-000000000006', 'James O''Brien', 'host', 'https://i.pravatar.cc/150?u=jamesobrien', NULL),
  ('00000000-0000-0000-0000-000000000007', 'Aisha Patel', 'guest', 'https://i.pravatar.cc/150?u=aishap', NULL),
  ('00000000-0000-0000-0000-000000000008', 'Chris Taylor', 'host', 'https://i.pravatar.cc/150?u=christaylor', NULL),
  ('00000000-0000-0000-0000-000000000009', 'Nina Kowalski', 'guest', 'https://i.pravatar.cc/150?u=ninak', NULL),
  ('00000000-0000-0000-0000-000000000010', 'Tom Rivera', 'producer', 'https://i.pravatar.cc/150?u=tomr', NULL);

-- Podcasts
INSERT INTO podcasts (id, title, author, description, image, categories, locked, medium, language, episode_count, license, location) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Podcasting 2.0', 'Adam Curry & Dave Jones', 'Discussing the future of podcasting with the creators of the Podcast Index. New features, new apps, and the open podcast ecosystem.', 'https://picsum.photos/seed/podcast2/400/400', ARRAY['tech', 'news'], false, 'podcast', 'en', 6, 'CC BY 4.0', 'Austin, TX'),
  ('00000000-0000-0000-0001-000000000002', 'Tech Frontiers', 'Sarah Chen', 'Exploring cutting-edge technology, AI breakthroughs, and the future of human-computer interaction. Weekly deep dives with industry leaders.', 'https://picsum.photos/seed/techfront/400/400', ARRAY['tech', 'science'], false, 'podcast', 'en', 5, NULL, NULL),
  ('00000000-0000-0000-0001-000000000003', 'The Comedy Hour', 'Marcus Johnson', 'Stand-up, sketches, and hilarious conversations with the funniest people on the planet. Warning: may cause involuntary laughter.', 'https://picsum.photos/seed/comedy1/400/400', ARRAY['comedy'], false, 'podcast', 'en', 5, NULL, NULL),
  ('00000000-0000-0000-0001-000000000004', 'World Report Daily', 'Elena Rodriguez', 'Your daily briefing on global news, geopolitics, and the stories that shape our world. Balanced, thorough, and independent.', 'https://picsum.photos/seed/worldnews/400/400', ARRAY['news', 'society'], true, 'podcast', 'en', 5, NULL, NULL),
  ('00000000-0000-0000-0001-000000000005', 'Open Source Jams', 'Chris Taylor', 'Celebrating music released under Creative Commons and open licenses. Discover new artists and support the open music movement.', 'https://picsum.photos/seed/osmusic/400/400', ARRAY['music'], false, 'music', 'en', 5, NULL, NULL),
  ('00000000-0000-0000-0001-000000000006', 'Mind & Body', 'Aisha Patel', 'Wellness, meditation, and the science of well-being. Practical tips for a healthier, happier life backed by research.', 'https://picsum.photos/seed/mindbody/400/400', ARRAY['health', 'science'], false, 'podcast', 'en', 5, NULL, NULL),
  ('00000000-0000-0000-0001-000000000007', 'Startup Stories', 'James O''Brien', 'Behind the scenes of building companies from zero to one. Founders share their real journeys — the wins, the failures, and the lessons.', 'https://picsum.photos/seed/startups/400/400', ARRAY['business', 'tech'], false, 'podcast', 'en', 5, NULL, NULL),
  ('00000000-0000-0000-0001-000000000008', 'History Unfolded', 'Nina Kowalski', 'Untold stories from history that shaped the modern world. Each episode is a journey through time with expert historians and primary sources.', 'https://picsum.photos/seed/historyunf/400/400', ARRAY['history', 'education'], false, 'podcast', 'en', 5, 'CC BY-NC 4.0', 'London, UK');

-- Podcast Funding
INSERT INTO podcast_funding (podcast_id, url, message) VALUES
  ('00000000-0000-0000-0001-000000000001', 'https://podcastindex.org/donate', 'Support the Index'),
  ('00000000-0000-0000-0001-000000000004', 'https://example.com/donate', 'Support independent journalism');

-- Value Configs for Podcasts
INSERT INTO value_configs (id, podcast_id, type, method) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'lightning', 'keysend'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'lightning', 'keysend'),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'lightning', 'keysend'),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000007', 'lightning', 'keysend');

-- Value Recipients
INSERT INTO value_recipients (value_config_id, name, type, address, split) VALUES
  ('00000000-0000-0000-0002-000000000001', 'Adam Curry', 'host', 'adam@getalby.com', 50),
  ('00000000-0000-0000-0002-000000000001', 'Dave Jones', 'host', 'dave@getalby.com', 40),
  ('00000000-0000-0000-0002-000000000001', 'Podverse App', 'app', 'app@getalby.com', 10),
  ('00000000-0000-0000-0002-000000000002', 'Sarah Chen', 'host', 'sarah@getalby.com', 90),
  ('00000000-0000-0000-0002-000000000002', 'Podverse App', 'app', 'app@getalby.com', 10),
  ('00000000-0000-0000-0002-000000000005', 'Chris Taylor', 'host', 'chris@getalby.com', 40),
  ('00000000-0000-0000-0002-000000000005', 'Artists Fund', 'wallet', 'artists@getalby.com', 50),
  ('00000000-0000-0000-0002-000000000005', 'Podverse App', 'app', 'app@getalby.com', 10),
  ('00000000-0000-0000-0002-000000000007', 'James O''Brien', 'host', 'james@getalby.com', 90),
  ('00000000-0000-0000-0002-000000000007', 'Podverse App', 'app', 'app@getalby.com', 10);

-- Episodes (Podcasting 2.0 - pc1)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', 'The State of Podcasting 2.0 in 2026', 'Adam and Dave review the massive growth of Podcasting 2.0 features, new apps, and the expanding namespace. Plus, a look at value-for-value adoption.', '2026-01-28T14:00:00Z', 4200, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', 'https://picsum.photos/seed/ep1/400/400', 3, 45, false),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000001', 'Chapters, Transcripts, and the Reading Experience', 'Deep dive into how chapters and transcripts transform the podcast listening experience. We demo the latest implementations across apps.', '2026-01-21T14:00:00Z', 3600, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, 3, 44, false),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0001-000000000001', 'Value4Value: Lightning Payments Hit Mainstream', 'The boostagram economy is thriving. We break down how podcasters are earning sats and how apps are integrating Lightning payments.', '2026-01-14T14:00:00Z', 3900, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, 3, 43, false),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000001', 'Live Podcasting and the Chat Revolution', 'Live streaming is the next frontier for podcasting. We discuss the technical challenges and the social dynamics of real-time podcast audiences.', '2026-01-07T14:00:00Z', 3300, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, 3, 42, false),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0001-000000000001', 'Cross-App Comments via ActivityPub', 'The social layer of podcasting is here. How ActivityPub enables comments that work across every Podcasting 2.0 app.', '2025-12-31T14:00:00Z', 2700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, 3, 41, false),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000001', 'Trailer: Welcome to Podcasting 2.0', 'An introduction to the show and what we cover — the open podcast ecosystem, new features, and the people building the future of podcasting.', '2025-01-01T00:00:00Z', 180, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, true);

-- Episodes (Tech Frontiers - pc2)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0001-000000000002', 'AI Agents Are Changing Everything', 'From coding assistants to autonomous research, AI agents are reshaping how we work. Sarah explores what''s real vs hype.', '2026-01-27T10:00:00Z', 3000, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', 'https://picsum.photos/seed/ep7/400/400', NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0001-000000000002', 'The Open Web Fights Back', 'RSS, ActivityPub, and decentralized protocols are seeing a renaissance. Is the open web winning?', '2026-01-20T10:00:00Z', 2400, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0001-000000000002', 'Spatial Computing Beyond the Headset', 'AR glasses, spatial audio, and ambient computing — the post-headset future is taking shape.', '2026-01-13T10:00:00Z', 2700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0001-000000000002', 'Quantum Computing: Year of the Breakthrough', '2026 may be the year quantum advantage becomes practical. We interview leading researchers.', '2026-01-06T10:00:00Z', 3600, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0001-000000000002', 'The Rise of Local-First Software', 'Sync engines, CRDTs, and building apps that work offline-first. The local-first movement is here to stay.', '2025-12-30T10:00:00Z', 2100, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false);

-- Episodes (The Comedy Hour - pc3)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0001-000000000003', 'New Year, Same Terrible Resolutions', 'Marcus roasts the worst New Year''s resolutions and interviews comedian Nina Kowalski about her tour.', '2026-01-26T18:00:00Z', 3600, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0001-000000000003', 'Tech Bros Try Cooking', 'The funniest videos of tech founders attempting to cook, plus stand-up bits about Silicon Valley culture.', '2026-01-19T18:00:00Z', 2700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0001-000000000003', 'Awkward Family Dinners Vol. 3', 'Listener stories about the most awkward family dinners of the holiday season.', '2026-01-12T18:00:00Z', 3000, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0001-000000000003', 'The Year in Memes: 2025 Edition', 'A comprehensive, deeply unnecessary review of every major meme from 2025.', '2026-01-05T18:00:00Z', 2400, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0001-000000000003', 'Holiday Travel Horror Stories', 'Airports, in-laws, and lost luggage. The funniest (and most painful) holiday travel tales from listeners.', '2025-12-29T18:00:00Z', 3300, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, NULL, NULL, false);

-- Episodes (World Report Daily - pc4)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0001-000000000004', 'Global Trade Shifts in 2026', 'How new trade agreements and tariff changes are reshaping the global economy.', '2026-01-29T06:00:00Z', 1800, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0001-000000000004', 'Climate Summit Recap', 'Key takeaways from the latest climate summit. What was agreed, what wasn''t, and what happens next.', '2026-01-22T06:00:00Z', 1500, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0001-000000000004', 'Election Watch: Super Tuesday Preview', 'Analysis of the upcoming primary elections and what the polls are telling us.', '2026-01-15T06:00:00Z', 2100, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0001-000000000004', 'Space Race 2.0: Moon Base Progress', 'Updates on the international effort to build permanent lunar habitats.', '2026-01-08T06:00:00Z', 1200, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0001-000000000004', 'Year in Review: 2025''s Biggest Stories', 'The defining events of 2025 and their lasting impact on the world stage.', '2026-01-01T06:00:00Z', 2700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false);

-- Episodes (Open Source Jams - pc5)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0001-000000000005', 'Lo-Fi Beats for Open Minds', 'A curated selection of the best lo-fi and chillhop tracks released under Creative Commons this month.', '2026-01-25T20:00:00Z', 3600, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0001-000000000005', 'Indie Electronic Discoveries', 'Electronic artists who are pushing boundaries and releasing their work freely. 10 tracks you need to hear.', '2026-01-18T20:00:00Z', 3000, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0001-000000000005', 'Acoustic Sessions Vol. 12', 'Beautiful acoustic performances from independent artists around the world.', '2026-01-11T20:00:00Z', 2400, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0001-000000000005', 'World Music Without Borders', 'From West African beats to Scandinavian folk, open-license world music that transcends geography.', '2026-01-04T20:00:00Z', 3300, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0001-000000000005', 'Best of 2025: Open Music Awards', 'Our picks for the best Creative Commons music released in 2025 across all genres.', '2025-12-28T20:00:00Z', 3600, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL, false);

-- Episodes (Mind & Body - pc6)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0001-000000000006', 'The Science of Sleep Optimization', 'New research on circadian rhythms, sleep stages, and practical tips for better rest.', '2026-01-24T08:00:00Z', 2700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0001-000000000006', 'Breathwork for Beginners', 'A guided introduction to breathing techniques that reduce stress and improve focus.', '2026-01-17T08:00:00Z', 1800, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0001-000000000006', 'Nutrition Myths Debunked', 'A registered dietitian joins to bust common nutrition myths with actual science.', '2026-01-10T08:00:00Z', 3000, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0001-000000000006', 'Movement as Medicine', 'How regular movement (not just exercise) transforms physical and mental health.', '2026-01-03T08:00:00Z', 2400, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0001-000000000006', 'Digital Detox: A 7-Day Challenge', 'Aisha shares her experience with a full week of reduced screen time and the surprising results.', '2025-12-27T08:00:00Z', 2100, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false);

-- Episodes (Startup Stories - pc7)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0001-000000000007', 'From Side Project to $10M ARR', 'The founder of a developer tools company shares how a weekend project became a venture-backed startup.', '2026-01-23T12:00:00Z', 3600, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0001-000000000007', 'Bootstrapping vs. VC: The Real Tradeoffs', 'Two founders debate the merits of bootstrapping versus taking venture capital.', '2026-01-16T12:00:00Z', 2700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0001-000000000007', 'The Pivot That Saved Our Company', 'When your original idea fails, how do you find the pivot that works? Three founders share their stories.', '2026-01-09T12:00:00Z', 3300, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0001-000000000007', 'Hiring Your First 10 Employees', 'The make-or-break decisions of early hiring. What to look for and what to avoid.', '2026-01-02T12:00:00Z', 2400, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0001-000000000007', 'Lessons from Failure: Shutting Down Gracefully', 'Not every startup succeeds. A founder shares the painful but valuable lessons of closing a company.', '2025-12-26T12:00:00Z', 3000, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false);

-- Episodes (History Unfolded - pc8)
INSERT INTO episodes (id, podcast_id, title, description, date_published, duration, enclosure_url, image, season, episode, is_trailer) VALUES
  ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0001-000000000008', 'The Library of Alexandria: What Really Happened', 'Separating myth from reality about the destruction of the ancient world''s greatest library.', '2026-01-22T16:00:00Z', 3600, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://picsum.photos/seed/ep37/400/400', NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0001-000000000008', 'The Forgotten Women of Computing', 'The untold stories of women who built the foundations of computer science long before Silicon Valley.', '2026-01-15T16:00:00Z', 3000, 'https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0001-000000000008', 'Silk Road: The Original Internet', 'How the ancient Silk Road connected civilizations and shaped global culture centuries before the web.', '2026-01-08T16:00:00Z', 2700, 'https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0001-000000000008', 'The Moon Landing Nobody Talks About', 'Beyond Apollo 11: the lesser-known lunar missions and their groundbreaking discoveries.', '2026-01-01T16:00:00Z', 3300, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL, false),
  ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0001-000000000008', 'Pompeii: A Day in the Life Before the Eruption', 'Archaeological evidence reveals what daily life was actually like in Pompeii before Vesuvius changed everything.', '2025-12-25T16:00:00Z', 2400, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL, false);

-- Episode Persons (linking episodes to persons)
INSERT INTO episode_persons (episode_id, person_id) VALUES
  -- Podcasting 2.0 episodes
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000002'),
  -- Tech Frontiers
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0000-000000000003'),
  -- Comedy Hour
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0000-000000000004'),
  -- World Report Daily
  ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0000-000000000005'),
  -- Open Source Jams
  ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0000-000000000008'),
  -- Mind & Body
  ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0000-000000000007'),
  -- Startup Stories
  ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0000-000000000006'),
  -- History Unfolded
  ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0000-000000000009');

-- Value Config for Episode 1
INSERT INTO value_configs (id, episode_id, type, method) VALUES
  ('00000000-0000-0000-0002-000000000101', '00000000-0000-0000-0003-000000000001', 'lightning', 'keysend');

INSERT INTO value_recipients (value_config_id, name, type, address, split) VALUES
  ('00000000-0000-0000-0002-000000000101', 'Adam Curry', 'host', 'adam@getalby.com', 50),
  ('00000000-0000-0000-0002-000000000101', 'Dave Jones', 'host', 'dave@getalby.com', 40),
  ('00000000-0000-0000-0002-000000000101', 'Podverse App', 'app', 'app@getalby.com', 10);

-- Social Interact
INSERT INTO social_interact (episode_id, uri, protocol) VALUES
  ('00000000-0000-0000-0003-000000000001', 'https://podcastindex.social/@pc20/123', 'activitypub');

-- Chapters
INSERT INTO chapters (episode_id, start_time, title, img, url) VALUES
  -- Episode 1
  ('00000000-0000-0000-0003-000000000001', 0, 'Intro & Overview', 'https://picsum.photos/seed/ch1/200/200', NULL),
  ('00000000-0000-0000-0003-000000000001', 300, 'Namespace Growth in 2025', 'https://picsum.photos/seed/ch2/200/200', NULL),
  ('00000000-0000-0000-0003-000000000001', 900, 'App Ecosystem Update', 'https://picsum.photos/seed/ch3/200/200', NULL),
  ('00000000-0000-0000-0003-000000000001', 1500, 'Value-for-Value Adoption Stats', 'https://picsum.photos/seed/ch4/200/200', 'https://podcastindex.org/stats'),
  ('00000000-0000-0000-0003-000000000001', 2400, 'New Features Demo', 'https://picsum.photos/seed/ch5/200/200', NULL),
  ('00000000-0000-0000-0003-000000000001', 3300, 'Listener Boostagrams', 'https://picsum.photos/seed/ch6/200/200', NULL),
  ('00000000-0000-0000-0003-000000000001', 3900, 'Wrap Up & Plugs', 'https://picsum.photos/seed/ch7/200/200', NULL),
  -- Episode 2
  ('00000000-0000-0000-0003-000000000002', 0, 'Introduction', NULL, NULL),
  ('00000000-0000-0000-0003-000000000002', 180, 'Why Chapters Matter', 'https://picsum.photos/seed/ch8/200/200', NULL),
  ('00000000-0000-0000-0003-000000000002', 720, 'Transcript Implementations', 'https://picsum.photos/seed/ch9/200/200', NULL),
  ('00000000-0000-0000-0003-000000000002', 1200, 'Guest: Elena on the Reading Experience', NULL, NULL),
  ('00000000-0000-0000-0003-000000000002', 2100, 'App Comparison Demo', 'https://picsum.photos/seed/ch10/200/200', NULL),
  ('00000000-0000-0000-0003-000000000002', 3000, 'Future of the Reading Layer', NULL, NULL),
  ('00000000-0000-0000-0003-000000000002', 3400, 'Closing Thoughts', NULL, NULL),
  -- Episode 3
  ('00000000-0000-0000-0003-000000000003', 0, 'Welcome', NULL, NULL),
  ('00000000-0000-0000-0003-000000000003', 120, 'Lightning Network Basics', NULL, NULL),
  ('00000000-0000-0000-0003-000000000003', 600, 'Boostagram Economy Stats', 'https://picsum.photos/seed/ch11/200/200', NULL),
  ('00000000-0000-0000-0003-000000000003', 1200, 'App Integration Showcase', NULL, NULL),
  ('00000000-0000-0000-0003-000000000003', 2100, 'Podcaster Earnings Reports', 'https://picsum.photos/seed/ch12/200/200', NULL),
  ('00000000-0000-0000-0003-000000000003', 3000, 'Value Time Splits Explained', NULL, NULL),
  ('00000000-0000-0000-0003-000000000003', 3600, 'Boostagrams of the Week', NULL, NULL),
  -- Episode 7 (Tech Frontiers)
  ('00000000-0000-0000-0003-000000000007', 0, 'Introduction', 'https://picsum.photos/seed/ch13/200/200', NULL),
  ('00000000-0000-0000-0003-000000000007', 240, 'What Are AI Agents?', NULL, NULL),
  ('00000000-0000-0000-0003-000000000007', 720, 'Coding Assistants Deep Dive', NULL, NULL),
  ('00000000-0000-0000-0003-000000000007', 1500, 'Guest Interview: Aisha Patel', NULL, NULL),
  ('00000000-0000-0000-0003-000000000007', 2100, 'Real vs. Hype', NULL, NULL),
  ('00000000-0000-0000-0003-000000000007', 2700, 'Predictions for 2026', NULL, NULL),
  -- Episode 37 (History)
  ('00000000-0000-0000-0003-000000000037', 0, 'Setting the Scene', 'https://picsum.photos/seed/ch14/200/200', NULL),
  ('00000000-0000-0000-0003-000000000037', 360, 'The Library at Its Peak', NULL, NULL),
  ('00000000-0000-0000-0003-000000000037', 900, 'The Myth of the Great Fire', NULL, NULL),
  ('00000000-0000-0000-0003-000000000037', 1800, 'What Really Happened', NULL, NULL),
  ('00000000-0000-0000-0003-000000000037', 2700, 'What Was Lost', NULL, NULL),
  ('00000000-0000-0000-0003-000000000037', 3300, 'Legacy and Lessons', NULL, NULL);

-- Transcript Segments
INSERT INTO transcript_segments (episode_id, start_time, end_time, speaker, text) VALUES
  -- Episode 1
  ('00000000-0000-0000-0003-000000000001', 0, 5, 'Adam Curry', 'Welcome to Podcasting 2.0, episode 45.'),
  ('00000000-0000-0000-0003-000000000001', 5, 12, 'Dave Jones', 'Thanks Adam. We''ve got a packed show today, covering the state of Podcasting 2.0 as we head into 2026.'),
  ('00000000-0000-0000-0003-000000000001', 12, 20, 'Adam Curry', 'It''s been an incredible year for the namespace. Let''s start with the numbers — and they are impressive.'),
  ('00000000-0000-0000-0003-000000000001', 20, 30, 'Dave Jones', 'Right. The Podcast Index now tracks over 4.2 million podcasts. Of those, 1.8 million are using at least one Podcasting 2.0 tag.'),
  ('00000000-0000-0000-0003-000000000001', 30, 40, 'Adam Curry', 'That''s a 40% increase from last year. And chapters and transcripts are leading adoption, which makes sense.'),
  ('00000000-0000-0000-0003-000000000001', 40, 52, 'Dave Jones', 'Chapters are in about 800,000 feeds now. Transcripts are at about 600,000. And value tags — this is the exciting one — are in over 200,000 feeds.'),
  ('00000000-0000-0000-0003-000000000001', 52, 65, 'Adam Curry', 'Two hundred thousand podcasts with value tags. Think about that. Two years ago that number was maybe 20,000.'),
  ('00000000-0000-0000-0003-000000000001', 65, 78, 'Dave Jones', 'The app ecosystem has been a huge driver. We''ve got — what is it now — 38 apps supporting some level of Podcasting 2.0?'),
  ('00000000-0000-0000-0003-000000000001', 78, 90, 'Adam Curry', '38 apps, and at least 15 of them support the full namespace. That''s chapters, transcripts, value, person tags, soundbites, the works.'),
  ('00000000-0000-0000-0003-000000000001', 90, 105, 'Dave Jones', 'Let''s talk about the new features that landed this year. We got podcast:medium finally being used widely...'),
  ('00000000-0000-0000-0003-000000000001', 105, 120, 'Adam Curry', 'Yeah, audiobooks in particular. Being able to mark a podcast feed as an audiobook and have apps display it differently — that''s a game changer.'),
  -- Episode 2
  ('00000000-0000-0000-0003-000000000002', 0, 8, 'Adam Curry', 'Episode 44 of Podcasting 2.0. Today we''re going deep on chapters and transcripts.'),
  ('00000000-0000-0000-0003-000000000002', 8, 18, 'Dave Jones', 'And we have a special guest — Elena Rodriguez — who''s been doing amazing work on the reading experience in podcast apps.'),
  ('00000000-0000-0000-0003-000000000002', 18, 28, 'Adam Curry', 'Elena, welcome to the show. Tell us about your work.'),
  ('00000000-0000-0000-0003-000000000002', 28, 45, 'Elena Rodriguez', 'Thanks for having me. I''ve been focused on how transcripts can transform podcasts from a purely audio medium into something more like a rich multimedia document.'),
  ('00000000-0000-0000-0003-000000000002', 45, 60, 'Elena Rodriguez', 'When you combine chapters with images, transcripts with speaker labels, and soundbites for sharing — you get this incredibly rich experience.'),
  ('00000000-0000-0000-0003-000000000002', 60, 75, 'Dave Jones', 'And the key insight is that these features work together. A chapter gives you the structure, the transcript gives you the text, and you can navigate between them.');

-- Soundbites
INSERT INTO soundbites (episode_id, start_time, duration, title) VALUES
  ('00000000-0000-0000-0003-000000000001', 52, 13, '200k podcasts with value tags!'),
  ('00000000-0000-0000-0003-000000000001', 78, 12, '38 apps supporting Podcasting 2.0'),
  ('00000000-0000-0000-0003-000000000002', 28, 17, 'Transcripts transform podcasts'),
  ('00000000-0000-0000-0003-000000000003', 600, 15, 'Boostagram economy stats'),
  ('00000000-0000-0000-0003-000000000007', 720, 20, 'Coding assistants deep dive'),
  ('00000000-0000-0000-0003-000000000012', 300, 30, 'The worst resolutions ever'),
  ('00000000-0000-0000-0003-000000000037', 900, 25, 'The myth of the great fire');

-- Comments
INSERT INTO comments (id, episode_id, author, author_avatar, text, platform, boost_amount, created_at) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', 'podcastfan42', 'https://i.pravatar.cc/150?u=podcastfan42', 'Great episode! The value-for-value stats are incredible. Boosted 1000 sats!', 'fountain', 1000, '2026-01-28T16:30:00Z'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000001', '@opensourcesam@mastodon.social', 'https://i.pravatar.cc/150?u=opensourcesam', 'Love how the namespace keeps evolving while staying backwards compatible. Good engineering.', 'mastodon', NULL, '2026-01-28T18:15:00Z'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000001', 'v4venthusiast', 'https://i.pravatar.cc/150?u=v4venthusiast', 'Can you do a deep dive on how value time splits work? I''m a podcaster trying to set this up.', 'podcastindex', NULL, '2026-01-29T09:00:00Z'),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000001', 'npub1abc...xyz', 'https://i.pravatar.cc/150?u=nostruser1', 'Streaming sats while listening to this. The future of media is here.', 'nostr', 500, '2026-01-28T20:45:00Z'),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000007', 'airesearcher', 'https://i.pravatar.cc/150?u=airesearcher', 'Excellent breakdown of the current agent landscape. Finally someone separating signal from noise.', 'mastodon', NULL, '2026-01-27T14:00:00Z'),
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000007', 'codemonkey99', 'https://i.pravatar.cc/150?u=codemonkey99', 'Using AI coding agents daily now. They''ve genuinely changed my workflow. Boosted!', 'fountain', 2000, '2026-01-27T15:30:00Z');

-- Comment Replies
INSERT INTO comments (episode_id, parent_id, author, author_avatar, text, platform, created_at) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0004-000000000001', 'lightninglarry', 'https://i.pravatar.cc/150?u=lightninglarry', 'Same! The growth is unreal. Podcasting 2.0 is the future.', 'fountain', '2026-01-28T17:00:00Z'),
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0004-000000000003', 'davejones_pi', 'https://i.pravatar.cc/150?u=davejones', 'Great idea! We''ll cover that in an upcoming episode.', 'podcastindex', '2026-01-29T10:30:00Z'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0004-000000000006', 'skepticdev', 'https://i.pravatar.cc/150?u=skepticdev', 'Which ones? I''ve tried a few and found them more hype than help.', 'fountain', '2026-01-27T16:00:00Z');
