const ENGLISH_CONTENT = {
  'สามคน สามสาย หนึ่งผลงานที่ใช้ได้จริง': 'Three people, three specialties, one practical solution.',
  'ทีมนักพัฒนา 3 คนที่แบ่งบทบาทชัดเจน ได้แก่ Frontend/UX, Backend/AI และ Database/DevOps ทำงานเป็นระบบด้วย Git + Pull Request และ deploy อัตโนมัติ เพื่อให้ส่งงานได้เร็วและตรวจสอบได้':
    'A team of three developers with clear roles in Frontend/UX, Backend/AI, and Database/DevOps. We use Git, pull requests, and automated deployments to deliver work efficiently and transparently.',
  'แบ่งบทบาทชัดเจน ครบตั้งแต่หน้าเว็บ AI ฐานข้อมูล จนถึง deploy':
    'Clear roles across frontend, AI, databases, and deployment.',
  'ออกแบบ UI ก่อนเขียนโค้ดเสมอ': 'We design the UI before writing code.',
  'AI ตอบจากข้อมูลจริงในฐานข้อมูล ไม่แต่งเอง': 'AI answers are grounded in database records.',
  'CI/CD อัตโนมัติ ทุก push ถูกทดสอบก่อน deploy': 'Automated CI/CD tests every push before deployment.',
  'รับผิดชอบการออกแบบ UI/UX และงาน Frontend พร้อมใช้ทักษะ Leadership ในการทำงานร่วมกับทีม':
    'Leads UI/UX design and frontend development, bringing strong leadership to the team.',
  'ดูแลเซิร์ฟเวอร์ Express และสมองของ AI ให้ตอบได้ตรงกับข้อมูลทีม':
    'Maintains the Express server and AI integration so answers stay grounded in team information.',
  'ออกแบบฐานข้อมูล PostgreSQL และดูแลระบบ build/deploy ให้ออนไลน์ตลอด':
    'Designs the PostgreSQL database and keeps build and deployment systems running smoothly.',
  'ออกแบบ UI/UX สำหรับเว็บไซต์': 'Design the website UI/UX',
  'ออกแบบ UI/UX': 'UI/UX Design',
  'พัฒนา Frontend': 'Develop the frontend',
  'สร้าง Backend API ด้วย Express.js': 'Build backend APIs with Express.js',
  'เชื่อมต่อ AI API': 'Integrate the AI API',
  'ออกแบบ System Prompt': 'Design the system prompt',
  'ออกแบบ System Prompt ให้ AI รู้จักสมาชิกทุกคน': 'Design system prompts that give the AI context about every member',
  'จัดการคำถามเกี่ยวกับกลุ่มและสมาชิก': 'Handle questions about the team and its members',
  'จัดการ Error และ API Response': 'Handle errors and API responses',
  'ทำระบบค้นหา/ดึงข้อมูล Portfolio มาเป็น Context': 'Retrieve relevant portfolio data as AI context',
  'ออกแบบฐานข้อมูล PostgreSQL': 'Design the PostgreSQL database',
  'สร้างตารางสมาชิกและ Portfolio': 'Create member and portfolio tables',
  'สร้างตารางเก็บประวัติการสนทนา': 'Create tables for chat history',
  'เชื่อมต่อ Database กับ Backend': 'Connect the database to the backend',
  'ตั้งค่า GitHub Actions': 'Configure GitHub Actions',
  'ตั้งค่า GitHub Actions สำหรับ CI/CD': 'Configure GitHub Actions for CI/CD',
  'จัดการ Environment Variables': 'Manage environment variables',
  'ดูแลการ Deploy และตรวจสอบระบบออนไลน์': 'Manage deployments and monitor the live system',
  'เว็บแอปให้ผู้เยี่ยมชมคุยกับ AI เพื่อถามเรื่องของทีมและสมาชิก':
    'A web app where visitors can ask an AI about the team and its members.',
  'เว็บแอปให้ผู้เยี่ยมชมคุยกับ AI เพื่อถามเรื่องของทีมและสมาชิก (โปรเจกต์ปลายภาคนี้)':
    'A web app where visitors can ask an AI about the team and its members.',
  'Chat AI พร้อม Portfolio': 'Chat AI Portfolio',
  'Chat AI พร้อม Portfolio (โปรเจกต์ปลายภาคนี้)': 'Chat AI Portfolio',
  'ออกแบบหลักการทำงานของเครื่องแปลงกรดฟอร์มิกด้วย 3D':
    '3D Formic Acid Converter Concept',
  'ออกแบบและสื่อสารหลักการทำงานของเครื่องผ่านโมเดล 3D':
    'Designed and presented the machine concept through a 3D model.',
  'ออกแบบเว็บไซต์': 'Website Design',
  'ออกแบบหน้าเว็บและประสบการณ์ใช้งานเว็บไซต์': 'Designed website layouts and user experiences.',
  'เว็บไซต์ตรวจทานคำภาษาไทย': 'Thai Text Proofreading Website',
  'ออกแบบเว็บไซต์สำหรับตรวจทานคำภาษาไทย': 'Designed a website for proofreading Thai text.',
  'Google Student Ambassador รุ่นที่ 2': 'Google Student Ambassador, Cohort 2',
  'เป็น Google Student Ambassador รุ่นที่ 2': 'Selected as a Google Student Ambassador, Cohort 2.',
  'REST API ระบบยืมคืนหนังสือ พร้อม JWT auth': 'A library lending REST API with JWT authentication.',
  'แชตบอทตอบคำถามจากเอกสารด้วย prompt + context': 'A document-based FAQ chatbot using prompts and context.',
  'pipeline build/test/deploy อัตโนมัติด้วย GitHub Actions': 'An automated build, test, and deployment pipeline with GitHub Actions.',
  'ออกแบบ ER diagram และ schema ระบบทะเบียนนักศึกษา': 'Designed an ER diagram and schema for a student records system.',
};

export function label(language, thai, english) {
  return language === 'en' ? english : thai;
}

export function content(value, language) {
  return language === 'en' ? (ENGLISH_CONTENT[value] || value) : value;
}
