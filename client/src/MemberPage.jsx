import { useEffect, useState } from 'react';
import { apiUrl } from './api.js';
import MemberAvatar from './MemberAvatar.jsx';

const COLORS = ['#8EC5FF', '#3B2418', '#8EC5FF'];

export default function MemberPage({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/portfolio'))
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
        <MemberAvatar member={m} large />
        <div>
          <p className="eyebrow">MEMBER {String(idx + 1).padStart(2, '0')} / {String(data.members.length).padStart(2, '0')}</p>
          <h1>{m.name}</h1>
          <p className="role">{m.role}</p>
          <p className="lead">{m.bio}</p>
          <button className="btn" onClick={askAI}>💬 ถาม AI เกี่ยวกับ{m.nickname}</button>
        </div>
      </section>

      <section>
        <SectionHeading number="01" label="SKILLS">ทักษะ</SectionHeading>
        <div className="chips skills">{m.skills.map((s) => <span key={s}>{s}</span>)}</div>
      </section>

      <section>
        <SectionHeading number="02" label="RESPONSIBILITIES">หน้าที่ในโปรเจกต์นี้</SectionHeading>
        <ul className="tasks">
          {(m.responsibilities || []).map((r, i) => <li key={i} className="glass">✔ {r}</li>)}
        </ul>
      </section>

      <section>
        <SectionHeading number="03" label="PROJECTS">ผลงาน</SectionHeading>
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

      {(m.linkedin || m.phone) && (
        <section>
          <SectionHeading number="04" label="CONTACT">ช่องทางการติดต่อ</SectionHeading>
          <div className="contacts">
            {m.phone && <a className="glass" href={`tel:${m.phone}`}>โทร {m.phone}</a>}
            {m.linkedin && <a className="glass" href={m.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
          </div>
        </section>
      )}

      <div className="pager">
        <a className="glass" href={`#/member/${prev.id}`}>← {prev.nickname}</a>
        <a className="glass" href={`#/member/${next.id}`}>{next.nickname} →</a>
      </div>
    </main>
  );
}

function SectionHeading({ number, label, children }) {
  return (
    <div className="section-heading">
      <span className="section-index">{number}</span>
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{children}</h2>
      </div>
    </div>
  );
}
