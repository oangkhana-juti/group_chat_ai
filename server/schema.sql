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
ALTER TABLE members ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS github TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT;

DO $$
DECLARE
  angkana_id INT;
BEGIN
  UPDATE members
  SET name = 'อังคนา จุติ',
      nickname = 'อัง',
      role = 'Frontend Developer & UI/UX Designer',
      bio = 'รับผิดชอบการออกแบบ UI/UX และงาน Frontend พร้อมใช้ทักษะ Leadership ในการทำงานร่วมกับทีม',
      skills = ARRAY['ออกแบบ UI/UX', 'Leadership'],
      responsibilities = ARRAY['ออกแบบ UI/UX สำหรับเว็บไซต์', 'พัฒนา Frontend'],
      linkedin = 'https://www.linkedin.com/in/oangkhana-juti-301a573b0/'
  WHERE name = 'สมหญิง รักเรียน' AND nickname = 'หญิง'
  RETURNING id INTO angkana_id;

  IF angkana_id IS NOT NULL THEN
    DELETE FROM projects WHERE member_id = angkana_id;
    INSERT INTO projects (member_id, title, description, tech, url) VALUES
      (angkana_id, 'ออกแบบหลักการทำงานของเครื่องแปลงกรดฟอร์มิกด้วย 3D', 'ออกแบบและสื่อสารหลักการทำงานของเครื่องผ่านโมเดล 3D', ARRAY['3D Design'], NULL),
      (angkana_id, 'ออกแบบเว็บไซต์', 'ออกแบบหน้าเว็บและประสบการณ์ใช้งานเว็บไซต์', ARRAY['UI/UX Design'], NULL),
      (angkana_id, 'เว็บไซต์ตรวจทานคำภาษาไทย', 'ออกแบบเว็บไซต์สำหรับตรวจทานคำภาษาไทย', ARRAY['UI/UX Design', 'Web Design'], NULL),
      (angkana_id, 'Google Student Ambassador รุ่นที่ 2', 'เป็น Google Student Ambassador รุ่นที่ 2', ARRAY[]::TEXT[], NULL);
  END IF;
END $$;

UPDATE members AS member
SET skills = COALESCE(member.skills, ARRAY[]::TEXT[]) || ARRAY(
  SELECT requested.skill
  FROM unnest(ARRAY['HTML/CSS', 'JavaScript', 'Figma']::TEXT[]) AS requested(skill)
  WHERE NOT (requested.skill = ANY(COALESCE(member.skills, ARRAY[]::TEXT[])))
)
WHERE member.name = 'อังคนา จุติ' AND member.nickname = 'อัง';

UPDATE members
SET responsibilities = array_remove(
  array_remove(responsibilities, 'ออกแบบหลักการทำงานของเครื่องแปลงกรดฟอร์มิกด้วย 3D'),
  'ออกแบบเว็บไซต์ตรวจทานคำภาษาไทย'
)
WHERE name = 'อังคนา จุติ' AND nickname = 'อัง';

UPDATE members
SET phone = '0821071919'
WHERE name = 'ธนภัค อัครธนาวัสส์' AND nickname = 'ขนุน';

UPDATE members
SET email = CASE
  WHEN name = 'อังคนา จุติ' AND nickname = 'อัง' THEN 'oangkhanajuti@gmail.com'
  WHEN name = 'สมชาย ใจดี' AND nickname = 'ชาย' THEN 'beurqk@gmail.com'
  WHEN name = 'ธนภัค อัครธนาวัสส์' AND nickname = 'ขนุน' THEN 'kanoonrobio@gmail.com'
  ELSE email
END
WHERE (name = 'อังคนา จุติ' AND nickname = 'อัง')
   OR (name = 'สมชาย ใจดี' AND nickname = 'ชาย')
   OR (name = 'ธนภัค อัครธนาวัสส์' AND nickname = 'ขนุน');

DO $$
DECLARE
  piemai_id INT;
BEGIN
  UPDATE members
  SET name = 'กนกภรณ์ วงค์จันทเรือง',
      nickname = 'ปีใหม่',
      role = 'Backend Developer & AI Engineer',
      bio = '',
      skills = ARRAY['JavaScript', 'API Integration', 'Prompt Engineering', 'Node.js', 'Express'],
      responsibilities = ARRAY[]::TEXT[],
      phone = '0815184715',
      email = 'beurqk@gmail.com',
      linkedin = NULL
  WHERE name = 'สมชาย ใจดี' AND nickname = 'ชาย'
  RETURNING id INTO piemai_id;

  IF piemai_id IS NOT NULL THEN
    DELETE FROM projects WHERE member_id = piemai_id;
    INSERT INTO projects (member_id, title, description, tech, url) VALUES
      (piemai_id, 'AI Hackathon Route Optimization 2026', 'Top 21 Semifinalist', ARRAY[]::TEXT[], NULL),
      (piemai_id, 'AIHack Thailand 2025 (AI x Financial Data)', 'Top 8 Finalist', ARRAY[]::TEXT[], NULL),
      (piemai_id, 'SME Financial Inclusion Hackathon 2025', NULL, ARRAY[]::TEXT[], NULL);
  END IF;
END $$;

UPDATE members
SET email = 'beurqk@gmail.com'
WHERE name = 'กนกภรณ์ วงค์จันทเรือง' AND nickname = 'ปีใหม่';

UPDATE members
SET github = CASE
  WHEN name = 'อังคนา จุติ' AND nickname = 'อัง' THEN 'https://github.com/oangkhana-juti'
  WHEN name = 'กนกภรณ์ วงค์จันทเรือง' AND nickname = 'ปีใหม่' THEN 'https://github.com/beurqk-bit'
  WHEN name = 'ธนภัค อัครธนาวัสส์' AND nickname = 'ขนุน' THEN 'https://github.com/kanoonrobio-art'
  ELSE github
END
WHERE (name = 'อังคนา จุติ' AND nickname = 'อัง')
   OR (name = 'กนกภรณ์ วงค์จันทเรือง' AND nickname = 'ปีใหม่')
   OR (name = 'ธนภัค อัครธนาวัสส์' AND nickname = 'ขนุน');

DELETE FROM projects
WHERE title = 'Campus Event Finder' AND member_id IS NULL;
