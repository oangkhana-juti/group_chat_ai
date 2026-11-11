import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

/** สร้างตารางและ seed ข้อมูล Portfolio ถ้ายังว่าง (retry เผื่อ DB ยังไม่พร้อม) */
export async function init(retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
      const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM team');
      if (rows[0].n === 0) {
        await pool.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
        console.log('Seeded portfolio data');
      }
      return;
    } catch (e) {
      console.log(`DB not ready (${e.message}), retrying...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Cannot connect to database');
}

export async function getPortfolio() {
  const team = (await pool.query('SELECT * FROM team LIMIT 1')).rows[0];
  const members = (await pool.query('SELECT * FROM members ORDER BY sort_order, id')).rows;
  const projects = (await pool.query('SELECT * FROM projects ORDER BY id')).rows;
  return {
    team,
    groupProjects: projects.filter((p) => p.member_id === null),
    members: members.map((m) => ({ ...m, projects: projects.filter((p) => p.member_id === m.id) })),
  };
}
