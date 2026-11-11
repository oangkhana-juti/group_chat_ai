import { useEffect, useState } from 'react';

const COLORS = ['#ff6b9d', '#4cc9f0', '#95f0a8', '#ffd166'];

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/portfolio')
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
        <p className="eyebrow">MEET THE TEAM · {members.length} MAKERS</p>
        <h1>{team.name}</h1>
        <p className="tagline">{team.tagline}</p>
        <a className="btn" href="#/chat">💬 ถาม AI เกี่ยวกับทีมเรา</a>
      </section>

      <section>
        <h2>แนวคิดของทีม</h2>
        <p className="lead">{team.concept}</p>
        <div className="grid2">
          {team.highlights.map((h, i) => (
            <div className="glass highlight" key={i}><b>0{i + 1}</b><span>{h}</span></div>
          ))}
        </div>
      </section>

      <section>
        <h2>ผลงานที่ทำร่วมกัน</h2>
        <div className="grid2">
          {groupProjects.map((p) => <ProjectCard key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <h2>สมาชิก</h2>
        <div className="grid2">
          {members.map((m, i) => (
            <a href={`#/member/${m.id}`} className="glass member" key={m.id} style={{ '--c': COLORS[i % COLORS.length] }}>
              <div className="avatar">{m.emoji}</div>
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
        <h2>ติดต่อเรา</h2>
        <div className="contacts">
          <a className="glass" href={`mailto:${team.email}`}>✉️ {team.email}</a>
          <a className="glass" href={team.github} target="_blank" rel="noreferrer">🐙 GitHub</a>
          <span className="glass">💚 LINE {team.line_id}</span>
          <span className="glass">📸 {team.instagram}</span>
        </div>
      </section>
      <footer>© {new Date().getFullYear()} {team.name}</footer>
    </main>
  );
}

function ProjectCard({ p, small }) {
  const body = (
    <>
      <b>{p.title}</b>
      <span>{p.description}</span>
      <div className="chips">{p.tech.map((t) => <span key={t}>{t}</span>)}</div>
    </>
  );
  const cls = `project ${small ? 'small' : 'glass'}`;
  return p.url && !small ? <a className={cls} href={p.url} target="_blank" rel="noreferrer">{body}</a> : <div className={cls}>{body}</div>;
}
