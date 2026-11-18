import { useEffect, useState } from 'react';
import { apiUrl } from './api.js';
import MemberAvatar from './MemberAvatar.jsx';

const COLORS = ['#8EC5FF', '#3B2418', '#8EC5FF'];

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/portfolio'))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('โหลดข้อมูล Portfolio ไม่สำเร็จ'));
  }, []);

  if (error) return <p className="center">{error}</p>;
  if (!data) return <p className="center">กำลังโหลด…</p>;
  const { team, members, groupProjects } = data;

  return (
    <main className="container">
      <section className="hero">
        <span className="hero-mark" aria-hidden="true">✦</span>
        <p className="eyebrow">MEET THE TEAM · {members.length} MAKERS</p>
        <h1>{team.name}</h1>
        <p className="tagline">{team.tagline}</p>
        <a className="btn" href="#/chat">💬 ถาม AI เกี่ยวกับทีมเรา</a>
        <p className="hero-note">รู้จักทีมของเรา · ผลงาน · และสมาชิกทุกคน</p>
      </section>

      <section>
        <SectionHeading number="01" label="ABOUT OUR TEAM">แนวคิดของทีม</SectionHeading>
        <p className="lead">{team.concept}</p>
        <div className="grid2">
          {team.highlights.map((h, i) => (
            <div className="glass highlight" key={i}><b>0{i + 1}</b><span>{h}</span></div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading number="02" label="GROUP PROJECTS">ผลงานที่ทำร่วมกัน</SectionHeading>
        <div className="grid2">
          {groupProjects.map((p) => <ProjectCard key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <SectionHeading number="03" label="OUR MEMBERS">สมาชิก</SectionHeading>
        <div className="grid2 member-grid">
          {members.map((m, i) => (
            <a href={`#/member/${m.id}`} className="glass member" key={m.id} style={{ '--c': COLORS[i % COLORS.length] }}>
              <MemberAvatar member={m} />
              <h3>{m.name} <small>({m.nickname})</small></h3>
              <p className="role">{m.role}</p>
              <p>{m.bio}</p>
              <div className="chips">{m.skills.map((s) => <span key={s}>{s}</span>)}</div>
              <h4>ผลงาน</h4>
              {m.projects.map((p) => <ProjectCard key={p.id} p={p} small />)}
              <span className="more">ดูโปรไฟล์เต็ม →</span>
            </a>
          ))}
        </div>
      </section>

      <section id="contact">
        <SectionHeading number="04" label="GET IN TOUCH">ติดต่อเรา</SectionHeading>
        <div className="contacts">
          {members.map((m) => (
            <a className="glass" href={`mailto:${m.email}`} key={m.id}>
              ✉️ {m.name}<br />{m.email}
            </a>
          ))}
        </div>
      </section>
      <footer>© {new Date().getFullYear()} {team.name}</footer>
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

function ProjectCard({ p, small }) {
  const body = (
    <>
      {!small && <div className="project-cover" aria-hidden="true"><span>✦</span></div>}
      <b>{p.title}</b>
      <span>{p.description}</span>
      <div className="chips">{p.tech.map((t) => <span key={t}>{t}</span>)}</div>
    </>
  );
  const cls = `project ${small ? 'small' : 'glass'}`;
  return p.url && !small ? <a className={cls} href={p.url} target="_blank" rel="noreferrer">{body}</a> : <div className={cls}>{body}</div>;
}
