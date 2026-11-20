# 🤖 Do Ra E Mo Nueng  — Chat AI พร้อม Portfolio ของกลุ่ม

เว็บแอปให้ผู้เยี่ยมชมดู Portfolio ของทีมและสมาชิกแต่ละคน และพูดคุยกับ AI ที่ตอบโดยอิงข้อมูลของกลุ่มและสมาชิกทุกคน

- 🌐 เว็บที่ deploy แล้ว: `https://oangkhana-juti.github.io/group_chat_ai/`
- 👥 สมาชิก: `อังคนา จุติ` , `ธนภัค อัครธนาวัสส์` , `กนกภรณ์ วงค์จันทเรือง`

## สถาปัตยกรรม

```
React (Vite)  ──/api──▶  Express  ──▶  PostgreSQL (team, members, projects, messages)
 Group + Member + Chat      │
                            └──▶ AI API (system prompt สร้างจากข้อมูลใน DB ทุกครั้งที่ถาม)
```

| ส่วน | เทคโนโลยี | ไฟล์สำคัญ |
|---|---|---|
| Frontend | React 18 + Vite | `client/src/Portfolio.jsx`, `MemberPage.jsx`, `Chat.jsx` |
| Backend | Node.js + Express | `server/index.js` |
| Database | PostgreSQL 16 | `server/schema.sql`, `server/seed.sql` |
| AI | Claude API (`@anthropic-ai/sdk`) | `server/ai.js` |
| CI/CD | GitHub Actions + GitHub Pages + Render | `.github/workflows/ci-cd.yml` |

### AI Integration ทำงานอย่างไร
1. ผู้ใช้ส่งข้อความ → `POST /api/chat`
2. Backend ดึงข้อมูลกลุ่ม/สมาชิก/ผลงานล่าสุดจาก PostgreSQL
3. `findRelevantMembers()` ค้นหาสมาชิกที่เกี่ยวข้องกับคำถาม (ชื่อ บทบาท ทักษะ ผลงาน)
4. `buildSystemPrompt()` ใส่ข้อมูลทั้งหมด + ผลค้นหาลง system prompt พร้อมกฎ "ตอบจากข้อมูลนี้เท่านั้น ห้ามแต่งเอง"
5. ส่งประวัติสนทนา 20 ข้อความล่าสุด + คำถามใหม่ให้ AI
6. บันทึกคำถามและคำตอบลงตาราง `messages`

> แก้ข้อมูลใน DB แล้ว AI จะรู้ทันที โดยไม่ต้องแก้โค้ด

### API
| Method | Path | หน้าที่ |
|---|---|---|
| GET | `/api/health` | ตรวจสถานะ server + DB |
| GET | `/api/portfolio` | ข้อมูลกลุ่ม สมาชิก ผลงาน |
| GET | `/api/chat/:sessionId` | ประวัติสนทนา |
| POST | `/api/chat` | `{ sessionId, message }` → `{ reply }` |

## ✏️ ก่อนเริ่ม: ใส่ข้อมูลกลุ่มของคุณ
แก้ `server/seed.sql` (ชื่อกลุ่ม แนวคิด สมาชิก ทักษะ ผลงาน ช่องทางติดต่อ) — seed ทำงานอัตโนมัติเมื่อตาราง `team` ว่าง

## Run on localhost
ต้องมี Node.js 20+, PostgreSQL 16+ ที่เปิดใช้งานอยู่ (ติดตั้งในเครื่องหรือใช้ฐานข้อมูลบนคลาวด์) และไฟล์ `.env` ที่ root หรือ `server/`
```bash
npm install                 # ติดตั้ง dependencies ครั้งเดียว
npm run dev                 # Frontend :3000 และ API :3001
```
บน PowerShell ให้คัดลอกไฟล์ตัวอย่างก่อนด้วย `Copy-Item server/.env.example server/.env`
ตั้ง `DATABASE_URL` ให้ชี้ไปยัง PostgreSQL ที่เปิดอยู่ และใส่ `ANTHROPIC_API_KEY` หากต้องการใช้แชต AI คำสั่ง `npm run dev` ไม่ได้เริ่มฐานข้อมูลให้โดยอัตโนมัติ; Vite ส่ง `/api` ไปยัง `API_URL` (ค่าเริ่มต้น `http://localhost:3001`)

```bash
npm run build                 # สร้างเว็บ static ไว้ที่ client/out/
npm run preview               # preview ที่ http://localhost:4173
```

ไฟล์ใน `client/public/` จะถูกคัดลอกไป `client/out/` เช่น `client/public/images/team.jpg` อ้างอิงใน React ด้วย `${import.meta.env.BASE_URL}images/team.jpg`

## Deploy
### Frontend: GitHub Pages
1. Repository Settings → Pages → เลือก **GitHub Actions** เป็น Source
2. Settings → Secrets and variables → Actions → Variables เพิ่ม `VITE_API_URL` เป็น URL ของ Render Web Service (เช่น `https://your-service.onrender.com`, ไม่ต้องลงท้ายด้วย `/`)
3. Push ไป `main`; workflow จะ build `client/out/` และเผยแพร่ไป GitHub Pages

### Backend และฐานข้อมูล: Render 
1. สร้าง **PostgreSQL** บน Render แล้วคัดลอก *Internal Database URL*
2. สร้าง **Web Service** จาก repo นี้ โดยตั้ง Root Directory เป็น `server`, Runtime เป็น **Node**, Build Command เป็น `npm ci`, Start Command เป็น `npm start`
3. ตั้ง Environment: `DATABASE_URL`, `PGSSL=true`, `ANTHROPIC_API_KEY`, `AI_MODEL`
4. สร้าง Deploy Hook สำหรับ Web Service แล้วเพิ่มเป็น GitHub Actions Secret ชื่อ `RENDER_DEPLOY_HOOK_URL`
5. ปิด Auto-Deploy บน Render เพื่อให้ GitHub Actions เรียก deploy หลังผ่านเทสต์

### CI/CD Pipeline
เมื่อ push / PR เข้า `main`:
1. **test** — build React, ติดตั้ง server, สตาร์ท API กับ PostgreSQL แล้ว smoke test (`/health`, `/portfolio`, validation 400)
2. **pages** (เฉพาะ push เข้า `main`) — deploy frontend ไป GitHub Pages
3. **deploy** (เฉพาะ push เข้า `main`) — trigger Render Web Service

## 🔐 ความปลอดภัย
- API key อยู่ฝั่ง server เท่านั้น ไม่ถูกส่งไปที่ browser 
- ใช้ `.env.example` เป็นแม่แบบ
- จำกัดความยาวข้อความ 1,000 ตัวอักษร และใช้ parameterized query ทุกจุด

## 📋 การแบ่งงานของทีม (3 คน)

| สมาชิก | บทบาท | ไฟล์ที่รับผิดชอบ |
|---|---|---|
| คนที่ 1 | **Frontend Developer & UI/UX Designer** — หน้า Group/Member Portfolio, Chat UI, ระบบส่งข้อความ/แสดงคำตอบ AI, Responsive, เชื่อม API | `client/` ทั้งหมด (`Portfolio.jsx`, `MemberPage.jsx`, `Chat.jsx`, `styles.css`, `vite.config.js`) |
| คนที่ 2 | **Backend Developer & AI Engineer** — Express API, เชื่อม AI, System Prompt, ระบบดึง/ค้นหา Portfolio เป็น Context, จัดการคำถามกลุ่ม/สมาชิก, Error & Response | `server/index.js`, `server/ai.js` |
| คนที่ 3 | **Database Engineer & DevOps** — ออกแบบ PostgreSQL, ตารางสมาชิก/Portfolio/ประวัติแชต, เชื่อม DB กับ Backend, GitHub Actions, Environment Variables, Deploy & monitoring | `server/schema.sql`, `server/seed.sql`, `server/db.js`, `.github/workflows/`, `.env.example` |


### Error Response ของ API
ทุก error ตอบเป็น JSON `{ "code": "...", "error": "ข้อความภาษาไทย" }`

| code | HTTP | ความหมาย |
|---|---|---|
| `BAD_REQUEST` / `BAD_JSON` | 400 | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| `AI_RATE_LIMIT` | 429 | เรียก AI ถี่เกินไป |
| `AI_NOT_CONFIGURED` / `AI_UNAVAILABLE` | 503 | ไม่มี API key / AI ไม่ตอบ (timeout 30 วินาที) |
| `AI_AUTH` / `AI_MODEL` / `AI_ERROR` | 502 | key ผิด / ชื่อโมเดลผิด / ข้อผิดพลาดอื่นจาก AI |
| `SERVER_ERROR` | 500 | ข้อผิดพลาดภายในเซิร์ฟเวอร์ (log ไว้ฝั่ง server) |
