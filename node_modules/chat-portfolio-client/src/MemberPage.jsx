import { useEffect, useState } from 'react';
import { apiUrl } from './api.js';
import MemberAvatar from './MemberAvatar.jsx';
import { content, label } from './i18n.js';
import { getMemberClass } from './memberClass.js';

const COLORS = ['#e59ab0', '#6fb1ea', '#8fd3a4'];

export default function MemberPage({ id, language }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/portfolio'))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(async () => {
        try {
          const r = await fetch(`${import.meta.env.BASE_URL}portfolio.json`);
          if (!r.ok) throw new Error();
          setData(await r.json());
        } catch {
          setError(label(language, 'โหลดข้อมูลไม่สำเร็จ', 'Could not load member information.'));
        }
      });
  }, []);

  if (error) return <p className="center">{error}</p>;
  if (!data) return <p className="center">{label(language, 'กำลังโหลด…', 'Loading…')}</p>;

  const idx = data.members.findIndex((m) => m.id === id);
  if (idx < 0) return <p className="center">{label(language, 'ไม่พบสมาชิกคนนี้', 'Member not found')} · <a href="#/" className="link">{label(language, 'กลับหน้าแรก', 'Back to home')}</a></p>;
  const m = data.members[idx];
  const prev = data.members[(idx - 1 + data.members.length) % data.members.length];
  const next = data.members[(idx + 1) % data.members.length];
  const hasResponsibilities = (m.responsibilities || []).length > 0;
  const hasContact = Boolean(m.linkedin || m.github || m.phone);

  function askAI() {
    sessionStorage.setItem('prefill', language === 'en'
      ? `Tell me about ${m.name}, their role on the team, and their projects.`
      : `เล่าเกี่ยวกับ${m.name}ให้ฟังหน่อย ทำอะไรในทีมและมีผลงานอะไรบ้าง?`);
    location.hash = '#/chat';
  }

  return (
    <main className="container" style={{ '--c': COLORS[idx % COLORS.length] }}>
      <a className="link back" href="#/">{label(language, '← กลับหน้ากลุ่ม', '← Back to team')}</a>

      <section className="profile" data-reveal>
        <MemberAvatar member={m} large language={language} />
        <div>
          <p className="eyebrow">MEMBER {String(idx + 1).padStart(2, '0')} / {String(data.members.length).padStart(2, '0')}</p>
          <h1>{m.name}</h1>
          <span className="cls">✦ {getMemberClass(m, idx, language)}</span>
          <p className="role">{m.role}</p>
          {m.bio && <p className="lead">{content(m.bio, language)}</p>}
          <button className="btn magnetic" onClick={askAI}>{label(language, `💬 ถาม AI เกี่ยวกับ${m.nickname}`, `💬 Ask AI about ${m.nickname}`)}</button>
        </div>
      </section>

      <section data-reveal>
        <SectionHeading number="01" label="SKILLS" className="reveal">{label(language, 'ทักษะ', 'Skills')}</SectionHeading>
        <div className="chips skills">{m.skills.map((s) => <span className="reveal" key={s}>{content(s, language)}</span>)}</div>
      </section>

      {hasResponsibilities && (
        <section data-reveal>
          <SectionHeading number="02" label="RESPONSIBILITIES" className="reveal">{label(language, 'หน้าที่ในโปรเจกต์นี้', 'Responsibilities')}</SectionHeading>
          <ul className="tasks">
            {m.responsibilities.map((r, i) => <li key={i} className="glass spotlight reveal">✔ {content(r, language)}</li>)}
          </ul>
        </section>
      )}

      <section data-reveal>
        <SectionHeading number={hasResponsibilities ? '03' : '02'} label="PROJECTS" className="reveal">{label(language, 'ผลงาน', 'Projects')}</SectionHeading>
        <div className="grid2">
          {m.projects.map((p) => (
            <div className="glass project spotlight reveal" key={p.id}>
              <b>{content(p.title, language)}</b>{p.description && <span>{content(p.description, language)}</span>}
              {p.tech?.length > 0 && <div className="chips">{p.tech.map((t) => <span key={t}>{content(t, language)}</span>)}</div>}
              {p.url && <a className="link" href={p.url} target="_blank" rel="noreferrer">{label(language, 'ดูผลงาน ↗', 'View project ↗')}</a>}
            </div>
          ))}
        </div>
      </section>

      {hasContact && (
        <section data-reveal>
          <SectionHeading number={hasResponsibilities ? '04' : '03'} label="CONTACT" className="reveal">{label(language, 'ช่องทางการติดต่อ', 'Contact')}</SectionHeading>
          <div className="contacts">
            {m.phone && <a className="glass" href={`tel:${m.phone}`}>{label(language, `โทร ${m.phone}`, `Call ${m.phone}`)}</a>}
            {m.linkedin && <a className="glass" href={m.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
            {m.github && <a className="glass" href={m.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
          </div>
        </section>
      )}

      <div className="pager" data-reveal>
        <a className="glass" href={`#/member/${prev.id}`}>{label(language, '← ', '← ')}{prev.nickname}</a>
        <a className="glass" href={`#/member/${next.id}`}>{next.nickname} →</a>
      </div>
    </main>
  );
}

function SectionHeading({ number, label, children, className = '' }) {
  return (
    <div className={`section-heading ${className}`}>
      <span className="section-index">{number}</span>
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{children}</h2>
      </div>
    </div>
  );
}
