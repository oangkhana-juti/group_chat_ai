CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  concept TEXT,
  highlights TEXT[] DEFAULT '{}',
  email TEXT, github TEXT, line_id TEXT, instagram TEXT
);
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  role TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  emoji TEXT DEFAULT '🙂',
  sort_order INT DEFAULT 0
);
-- member_id = NULL หมายถึงผลงานที่ทำร่วมกันทั้งกลุ่ม
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tech TEXT[] DEFAULT '{}',
  url TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT '{}';
