# 🤖 TeamFolio — Chat AI พร้อม Portfolio ของกลุ่ม

เว็บแอปให้ผู้เยี่ยมชมดู Portfolio ของทีมและสมาชิกแต่ละคน และพูดคุยกับ AI ที่ตอบโดยอิงข้อมูลของกลุ่มและสมาชิกทุกคน

- 🌐 เว็บที่ deploy แล้ว: `ใส่ลิงก์ที่นี่`
- 👥 สมาชิก: `ใส่ชื่อสมาชิก`

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
| CI/CD | GitHub Actions + Docker + Render | `.github/workflows/ci-cd.yml` |

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
ถ้าเคยรันแล้วต้องการ seed ใหม่: `docker compose down -v`

## 🚀 รันด้วย Docker (ง่ายที่สุด)
```bash
cp .env.example .env        # ใส่ ANTHROPIC_API_KEY
docker compose up --build
# เปิด http://localhost:3001
```

## 🛠️ รันแบบ Development
ต้องมี Node.js 20+ และ PostgreSQL
```bash
createdb portfolio
cp .env.example .env        # แก้ DATABASE_URL และใส่ API key

# Terminal 1 — backend (port 3001)
cd server && npm install
export $(grep -v '^#' ../.env | xargs) && npm run dev

# Terminal 2 — frontend (port 5173, proxy /api ไป 3001)
cd client && npm install && npm run dev
```

## ☁️ Deploy (Render)
1. สร้าง **PostgreSQL** บน Render → คัดลอก *Internal Database URL*
2. สร้าง **Web Service** จาก GitHub repo นี้ (Runtime: Docker)
3. ตั้ง Environment: `DATABASE_URL`, `PGSSL=true`, `ANTHROPIC_API_KEY`, `AI_MODEL`
4. Settings → *Deploy Hook* → คัดลอก URL
5. GitHub repo → Settings → Secrets → Actions → เพิ่ม `RENDER_DEPLOY_HOOK_URL`
6. ปิด Auto-Deploy บน Render (ให้ GitHub Actions เป็นคน trigger หลังผ่านเทสต์)

## 🔄 CI/CD Pipeline
เมื่อ push / PR เข้า `main`:
1. **test** — build React, ติดตั้ง server, สตาร์ท API กับ Postgres จริง แล้ว smoke test (`/health`, `/portfolio`, validation 400)
2. **docker** (เฉพาะ `main`) — build image แล้ว push ไป GitHub Container Registry
3. **deploy** (เฉพาะ `main`) — เรียก Render Deploy Hook

## 🔐 ความปลอดภัย
- API key อยู่ฝั่ง server เท่านั้น ไม่ถูกส่งไปที่ browser
- `.env` อยู่ใน `.gitignore`; ใช้ `.env.example` เป็นแม่แบบ
- จำกัดความยาวข้อความ 1,000 ตัวอักษร และใช้ parameterized query ทุกจุด

## 📋 การแบ่งงานของทีม (3 คน)

| สมาชิก | บทบาท | ไฟล์ที่รับผิดชอบ |
|---|---|---|
| คนที่ 1 | **Frontend Developer & UI/UX Designer** — หน้า Group/Member Portfolio, Chat UI, ระบบส่งข้อความ/แสดงคำตอบ AI, Responsive, เชื่อม API | `client/` ทั้งหมด (`Portfolio.jsx`, `MemberPage.jsx`, `Chat.jsx`, `styles.css`, `vite.config.js`) |
| คนที่ 2 | **Backend Developer & AI Engineer** — Express API, เชื่อม AI, System Prompt, ระบบดึง/ค้นหา Portfolio เป็น Context, จัดการคำถามกลุ่ม/สมาชิก, Error & Response | `server/index.js`, `server/ai.js` |
| คนที่ 3 | **Database Engineer & DevOps** — ออกแบบ PostgreSQL, ตารางสมาชิก/Portfolio/ประวัติแชต, เชื่อม DB กับ Backend, GitHub Actions, Environment Variables, Deploy & monitoring | `server/schema.sql`, `server/seed.sql`, `server/db.js`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/`, `.env.example` |

### จุดที่ควรอธิบายได้ (เตรียมสอบ Technical Understanding)
- **คนที่ 1**: hash routing ทำงานอย่างไร, `fetch` + state ใน `Chat.jsx`, ทำไมต้องมี proxy `/api` ใน Vite, CSS responsive (`@media`, `dvh`, grid auto-fit)
- **คนที่ 2**: `buildSystemPrompt()` สร้าง context อย่างไร, `findRelevantMembers()` ให้คะแนนอย่างไร (alias ภาษาไทย + คำอังกฤษ), การ map error จาก AI → HTTP status (`mapError`), ทำไมเรียก AI ฝั่ง server
- **คนที่ 3**: ER diagram (team / members / projects / messages) และ FK, `member_id = NULL` แปลว่าอะไร, parameterized query, multi-stage Dockerfile, ลำดับ job ใน CI/CD, ทำไมไม่ commit `.env`

### Error Response ของ API
ทุก error ตอบเป็น JSON `{ "code": "...", "error": "ข้อความภาษาไทย" }`

| code | HTTP | ความหมาย |
|---|---|---|
| `BAD_REQUEST` / `BAD_JSON` | 400 | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| `AI_RATE_LIMIT` | 429 | เรียก AI ถี่เกินไป |
| `AI_NOT_CONFIGURED` / `AI_UNAVAILABLE` | 503 | ไม่มี API key / AI ไม่ตอบ (timeout 30 วินาที) |
| `AI_AUTH` / `AI_MODEL` / `AI_ERROR` | 502 | key ผิด / ชื่อโมเดลผิด / ข้อผิดพลาดอื่นจาก AI |
| `SERVER_ERROR` | 500 | ข้อผิดพลาดภายในเซิร์ฟเวอร์ (log ไว้ฝั่ง server) |
