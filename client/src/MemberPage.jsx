import { useEffect, useState } from 'react';

const COLORS = ['#ff6b9d', '#4cc9f0', '#95f0a8', '#ffd166'];

export default function MemberPage({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('โหลดข้อมูลไม่สำเร็จ'));
  }, []);

  if (error) return <p className="center">{error}</p>;
  if (!data) return <p className="center">กำลังโหลด…</p>;

  const idx = data.members.findIndex((m) => m.id === id);
  if (idx < 0) return <p className="center">ไม่พบสมาชิกคนนี้ · <a href="#/" className="link">กลับหน้าแรก</a></p>;
  const m = data.members[idx];
  const prev = data.members[(idx - 1 + data.members.length) % data.members.length];
  const next = data.members[(idx + 1) % data.members.length];

  function askAI() {
    sessionStorage.setItem('prefill', `เล่าเกี่ยวกับ${m.name}ให้ฟังหน่อย ทำอะไรในทีมและมีผลงานอะไรบ้าง?`);
    location.hash = '#/chat';
  }

  return (
    <main className="container" style={{ '--c': COLORS[idx % COLORS.length] }}>
      <a className="link back" href="#/">← กลับหน้ากลุ่ม</a>

      <section className="profile">
        <div className="avatar xl">{m.emoji}</div>
        <div>
          <p className="eyebrow">MEMBER {String(idx + 1).padStart(2, '0')} / {String(data.members.length).padStart(2, '0')}</p>
          <h1>{m.name}</h1>
          <p className="role">{m.role}</p>
          <p className="lead">{m.bio}</p>
          <button className="btn" onClick={askAI}>💬 ถาม AI เกี่ยวกับ{m.nickname}</button>
        </div>
      </section>

      <section>
        <h2>ทักษะ</h2>
        <div className="chips skills">{m.skills.map((s) => <span key={s}>{s}</span>)}</div>
      </section>

      <section>
        <h2>หน้าที่ในโปรเจกต์นี้</h2>
        <ul className="tasks">
          {(m.responsibilities || []).map((r, i) => <li key={i} className="glass">✔ {r}</li>)}
        </ul>
      </section>

      <section>
        <h2>ผลงาน</h2>
        <div className="grid2">
          {m.projects.map((p) => (
            <div className="glass project" key={p.id}>
              <b>{p.title}</b><span>{p.description}</span>
              <div className="chips">{p.tech.map((t) => <span key={t}>{t}</span>)}</div>
              {p.url && <a className="link" href={p.url} target="_blank" rel="noreferrer">ดูผลงาน ↗</a>}
            </div>
          ))}
        </div>
      </section>

      <div className="pager">
        <a className="glass" href={`#/member/${prev.id}`}>← {prev.nickname}</a>
        <a className="glass" href={`#/member/${next.id}`}>{next.nickname} →</a>
      </div>
    </main>
  );
}
