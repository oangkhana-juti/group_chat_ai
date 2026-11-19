-- ⚠️ ข้อมูลตัวอย่าง: แก้เป็นข้อมูลจริงของกลุ่มคุณ (seed ทำงานเมื่อตาราง team ยังว่างเท่านั้น)
INSERT INTO team (name, tagline, concept, highlights, email, github, line_id, instagram) VALUES (
  'Do Ra E Mo Nueng',
  'สามคน สามสาย หนึ่งผลงานที่ใช้ได้จริง',
  'ทีมนักพัฒนา 3 คนที่แบ่งบทบาทชัดเจน ได้แก่ Frontend/UX, Backend/AI และ Database/DevOps ทำงานเป็นระบบด้วย Git + Pull Request และ deploy อัตโนมัติ เพื่อให้ส่งงานได้เร็วและตรวจสอบได้',
  ARRAY['แบ่งบทบาทชัดเจน ครบตั้งแต่หน้าเว็บ AI ฐานข้อมูล จนถึง deploy','ออกแบบ UI ก่อนเขียนโค้ดเสมอ','AI ตอบจากข้อมูลจริงในฐานข้อมูล ไม่แต่งเอง','CI/CD อัตโนมัติ ทุก push ถูกทดสอบก่อน deploy'],
  'team@example.com','https://github.com/your-team','@pixelpioneers','@pixel.pioneers'
);
INSERT INTO members (name, nickname, role, bio, skills, responsibilities, emoji, sort_order, linkedin, github, phone, email) VALUES
 ('อังคนา จุติ','อัง','Frontend Developer & UI/UX Designer',
  'รับผิดชอบการออกแบบ UI/UX และงาน Frontend พร้อมใช้ทักษะ Leadership ในการทำงานร่วมกับทีม',
  '{"ออกแบบ UI/UX","Leadership","HTML/CSS","JavaScript","Figma"}',
  '{"ออกแบบ UI/UX สำหรับเว็บไซต์","พัฒนา Frontend"}',
  '🎨',1,'https://www.linkedin.com/in/oangkhana-juti-301a573b0/','https://github.com/oangkhana-juti',NULL,'oangkhanajuti@gmail.com'),
 ('กนกภรณ์ วงค์จันทเรือง','ปีใหม่','Backend Developer & AI Engineer',
  '',
  '{"JavaScript","API Integration","Prompt Engineering","Node.js","Express"}',
  '{}',
  '🧠',2,NULL,'https://github.com/beurqk-bit','0815184715','beurqk@gmail.com'),
 ('ธนภัค อัครธนาวัสส์','ขนุน','Database Engineer & DevOps',
  'ออกแบบฐานข้อมูล PostgreSQL และดูแลระบบ build/deploy ให้ออนไลน์ตลอด',
  '{"PostgreSQL","SQL","Docker","GitHub Actions","CI/CD","Linux","Environment Management"}',
  '{"ออกแบบฐานข้อมูล PostgreSQL","สร้างตารางสมาชิกและ Portfolio","สร้างตารางเก็บประวัติการสนทนา","เชื่อมต่อ Database กับ Backend","ตั้งค่า GitHub Actions สำหรับ CI/CD","จัดการ Environment Variables","ดูแลการ Deploy และตรวจสอบระบบออนไลน์"}',
  '🚀',3,NULL,'https://github.com/kanoonrobio-art','0821071919','kanoonrobio@gmail.com');
INSERT INTO projects (member_id, title, description, tech, url) VALUES
 (NULL,'Chat AI พร้อม Portfolio','เว็บแอปให้ผู้เยี่ยมชมคุยกับ AI เพื่อถามเรื่องของทีมและสมาชิก (โปรเจกต์ปลายภาคนี้)','{"React","Express","PostgreSQL","Claude API","GitHub Actions"}',NULL),
 ((SELECT id FROM members WHERE nickname='อัง'),'ออกแบบหลักการทำงานของเครื่องแปลงกรดฟอร์มิกด้วย 3D','ออกแบบและสื่อสารหลักการทำงานของเครื่องผ่านโมเดล 3D','{"3D Design"}',NULL),
 ((SELECT id FROM members WHERE nickname='อัง'),'ออกแบบเว็บไซต์','ออกแบบหน้าเว็บและประสบการณ์ใช้งานเว็บไซต์','{"UI/UX Design"}',NULL),
 ((SELECT id FROM members WHERE nickname='อัง'),'เว็บไซต์ตรวจทานคำภาษาไทย','ออกแบบเว็บไซต์สำหรับตรวจทานคำภาษาไทย','{"UI/UX Design","Web Design"}',NULL),
 ((SELECT id FROM members WHERE nickname='อัง'),'Google Student Ambassador รุ่นที่ 2','เป็น Google Student Ambassador รุ่นที่ 2', '{}',NULL),
 ((SELECT id FROM members WHERE nickname='ปีใหม่'),'AI Hackathon Route Optimization 2026','Top 21 Semifinalist','{}',NULL),
 ((SELECT id FROM members WHERE nickname='ปีใหม่'),'AIHack Thailand 2025 (AI x Financial Data)','Top 8 Finalist','{}',NULL),
 ((SELECT id FROM members WHERE nickname='ปีใหม่'),'SME Financial Inclusion Hackathon 2025',NULL,'{}',NULL),
 ((SELECT id FROM members WHERE nickname='ขนุน'),'Auto Deploy Pipeline','pipeline build/test/deploy อัตโนมัติด้วย GitHub Actions','{"Docker","GitHub Actions"}',NULL),
 ((SELECT id FROM members WHERE nickname='ขนุน'),'Student DB Design','ออกแบบ ER diagram และ schema ระบบทะเบียนนักศึกษา','{"PostgreSQL","SQL"}',NULL);
