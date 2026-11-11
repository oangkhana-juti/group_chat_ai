-- ⚠️ ข้อมูลตัวอย่าง: แก้เป็นข้อมูลจริงของกลุ่มคุณ (seed ทำงานเมื่อตาราง team ยังว่างเท่านั้น)
INSERT INTO team (name, tagline, concept, highlights, email, github, line_id, instagram) VALUES (
  'Pixel Pioneers',
  'สามคน สามสาย หนึ่งผลงานที่ใช้ได้จริง',
  'ทีมนักพัฒนา 3 คนที่แบ่งบทบาทชัดเจน ได้แก่ Frontend/UX, Backend/AI และ Database/DevOps ทำงานเป็นระบบด้วย Git + Pull Request และ deploy อัตโนมัติ เพื่อให้ส่งงานได้เร็วและตรวจสอบได้',
  ARRAY['แบ่งบทบาทชัดเจน ครบตั้งแต่หน้าเว็บ AI ฐานข้อมูล จนถึง deploy','ออกแบบ UI ก่อนเขียนโค้ดเสมอ','AI ตอบจากข้อมูลจริงในฐานข้อมูล ไม่แต่งเอง','CI/CD อัตโนมัติ ทุก push ถูกทดสอบก่อน deploy'],
  'team@example.com','https://github.com/your-team','@pixelpioneers','@pixel.pioneers'
);
INSERT INTO members (name, nickname, role, bio, skills, responsibilities, emoji, sort_order) VALUES
 ('สมหญิง รักเรียน','หญิง','Frontend Developer & UI/UX Designer',
  'รับผิดชอบหน้าตาและประสบการณ์ใช้งานทั้งหมดของเว็บ ตั้งแต่ออกแบบจนถึงเขียน React',
  '{"React","Vite","CSS","Responsive Design","Figma","UX Design"}',
  '{"ออกแบบหน้า Group Portfolio","ออกแบบหน้า Member Portfolio","สร้าง Chat UI ด้วย React","ทำระบบส่งข้อความและแสดงคำตอบ AI","Responsive Design รองรับมือถือ","เชื่อมต่อ Frontend กับ Backend API"}',
  '🎨',1),
 ('สมชาย ใจดี','ชาย','Backend Developer & AI Engineer',
  'ดูแลเซิร์ฟเวอร์ Express และสมองของ AI ให้ตอบได้ตรงกับข้อมูลทีม',
  '{"Node.js","Express","REST API","Prompt Engineering","AI API","Error Handling"}',
  '{"สร้าง Backend API ด้วย Express.js","เชื่อมต่อ AI API","ออกแบบ System Prompt ให้ AI รู้จักสมาชิกทุกคน","ทำระบบค้นหา/ดึงข้อมูล Portfolio มาเป็น Context","จัดการคำถามเกี่ยวกับกลุ่มและสมาชิก","จัดการ Error และ API Response"}',
  '🧠',2),
 ('พิมพ์ใจ สุขสม','พิม','Database Engineer & DevOps',
  'ออกแบบฐานข้อมูล PostgreSQL และดูแลระบบ build/deploy ให้ออนไลน์ตลอด',
  '{"PostgreSQL","SQL","Docker","GitHub Actions","CI/CD","Linux","Environment Management"}',
  '{"ออกแบบฐานข้อมูล PostgreSQL","สร้างตารางสมาชิกและ Portfolio","สร้างตารางเก็บประวัติการสนทนา","เชื่อมต่อ Database กับ Backend","ตั้งค่า GitHub Actions สำหรับ CI/CD","จัดการ Environment Variables","ดูแลการ Deploy และตรวจสอบระบบออนไลน์"}',
  '🚀',3);
INSERT INTO projects (member_id, title, description, tech, url) VALUES
 (NULL,'Chat AI พร้อม Portfolio','เว็บแอปให้ผู้เยี่ยมชมคุยกับ AI เพื่อถามเรื่องของทีมและสมาชิก (โปรเจกต์ปลายภาคนี้)','{"React","Express","PostgreSQL","Claude API","GitHub Actions"}',NULL),
 (NULL,'Campus Event Finder','เว็บค้นหากิจกรรมในมหาวิทยาลัย งานกลุ่มจากวิชาก่อนหน้า','{"React","Firebase"}',NULL),
 ((SELECT id FROM members WHERE nickname='หญิง'),'Weather Dashboard','แดชบอร์ดพยากรณ์อากาศแบบ responsive พร้อมกราฟ','{"React","Chart.js"}',NULL),
 ((SELECT id FROM members WHERE nickname='หญิง'),'Café App Redesign','รีดีไซน์แอปสั่งกาแฟใน Figma พร้อมทำ usability test','{"Figma"}',NULL),
 ((SELECT id FROM members WHERE nickname='ชาย'),'Library API','REST API ระบบยืมคืนหนังสือ พร้อม JWT auth','{"Node.js","Express","PostgreSQL"}',NULL),
 ((SELECT id FROM members WHERE nickname='ชาย'),'FAQ Chatbot','แชตบอทตอบคำถามจากเอกสารด้วย prompt + context','{"Node.js","AI API"}',NULL),
 ((SELECT id FROM members WHERE nickname='พิม'),'Auto Deploy Pipeline','pipeline build/test/deploy อัตโนมัติด้วย GitHub Actions','{"Docker","GitHub Actions"}',NULL),
 ((SELECT id FROM members WHERE nickname='พิม'),'Student DB Design','ออกแบบ ER diagram และ schema ระบบทะเบียนนักศึกษา','{"PostgreSQL","SQL"}',NULL);
