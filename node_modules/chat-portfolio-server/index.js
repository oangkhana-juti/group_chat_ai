import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { init, pool, getPortfolio } from './db.js';
import { askAI, AppError } from './ai.js';

const app = express();
const dir = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_LIMIT = 20; // จำนวนข้อความย้อนหลังที่ส่งให้ AI

app.use(cors());
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ status: 'db error' });
  }
});

app.get('/api/portfolio', async (_req, res, next) => {
  try { res.json(await getPortfolio()); } catch (e) { next(e); }
});

app.get('/api/chat/:sessionId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT role, content, created_at FROM messages WHERE session_id=$1 ORDER BY id',
      [req.params.sessionId]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/chat', async (req, res, next) => {
  try {
    const { sessionId, message } = req.body || {};
    if (!sessionId || typeof message !== 'string' || !message.trim() || message.length > 1000) {
      return res.status(400).json({ code: 'BAD_REQUEST', error: 'ต้องมี sessionId และ message (ไม่เกิน 1000 ตัวอักษร)' });
    }
    const past = (
      await pool.query(
        'SELECT role, content FROM messages WHERE session_id=$1 ORDER BY id DESC LIMIT $2',
        [sessionId, HISTORY_LIMIT]
      )
    ).rows.reverse();

    const portfolio = await getPortfolio(); // ดึงข้อมูลล่าสุดจาก DB ทุกครั้ง
    const reply = await askAI(portfolio, [...past, { role: 'user', content: message.trim() }]);

    await pool.query(
      `INSERT INTO messages (session_id, role, content) VALUES ($1,'user',$2), ($1,'assistant',$3)`,
      [sessionId, message.trim(), reply]
    );
    res.json({ reply });
  } catch (e) { next(e); }
});

// เสิร์ฟ React ที่ build แล้ว (production / Docker)
const pub = path.join(dir, 'public');
if (fs.existsSync(pub)) app.use(express.static(pub));

// 404 สำหรับ /api ที่ไม่มีอยู่จริง
app.use('/api', (_req, res) => res.status(404).json({ code: 'NOT_FOUND', error: 'ไม่พบ endpoint นี้' }));

// ตัวจัดการ error กลาง: ตอบเป็น JSON { code, error } เสมอ
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ code: 'BAD_JSON', error: 'รูปแบบ JSON ไม่ถูกต้อง' });
  if (err instanceof AppError) return res.status(err.status).json({ code: err.code, error: err.message });
  console.error(err);
  res.status(500).json({ code: 'SERVER_ERROR', error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
});

const PORT = process.env.PORT || 3001;
await init();
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
