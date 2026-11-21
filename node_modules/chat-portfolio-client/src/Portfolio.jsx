import { useEffect, useState } from 'react';
import { apiUrl } from './api.js';
import MemberAvatar from './MemberAvatar.jsx';
import { content, label } from './i18n.js';
import { getMemberClass } from './memberClass.js';

const COLORS = ['#e59ab0', '#6fb1ea', '#8fd3a4'];

export default function Portfolio({ language, section, onScrollToSection }) {
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
          setError(label(language, 'โหลดข้อมูล Portfolio ไม่สำเร็จ', 'Could not load the portfolio.'));
        }
      });
  }, []);

  useEffect(() => {
    if (!data || !section) return;
    onScrollToSection(section);
  }, [data, section, onScrollToSection]);

  if (error) return <p className="center">{error}</p>;
  if (!data) return <p className="center">{label(language, 'กำลังโหลด…', 'Loading…')}</p>;
  const { team, members, groupProjects } = data;

  return (
    <main className="container">
      <section className="hero" data-reveal="hero">
        <span className="hero-mark" aria-hidden="true">✦</span>
        <span className="hero-rings" aria-hidden="true" />
        <p className="eyebrow">
          ✦ {members.length === 3 ? 'THREE SORCERERS' : `${members.length} SORCERERS`} · ONE SPELLBOOK ✦
        </p>
        <h1 className="hero-title reveal">{team.name}</h1>
        <p className="tagline">{content(team.tagline, language)}</p>
        <a className="btn magnetic" href="#/chat">{label(language, '💬 ถาม AI เกี่ยวกับทีมเรา', '💬 Ask our AI about the team')}</a>
        <p className="hero-note">{label(language, 'รู้จักทีมของเรา · ผลงาน · และสมาชิกทุกคน', 'Meet our team · explore our work · get to know every member')}</p>
      </section>

      <section id="about" data-reveal>
        <SectionHeading number="01" label={label(language, 'เกี่ยวกับทีม', 'ABOUT OUR TEAM')} className="reveal">{label(language, 'แนวคิดของทีม', 'About Our Team')}</SectionHeading>
        <p className="lead">{content(team.concept, language)}</p>
        <div className="grid2">
          {team.highlights.map((highlight, i) => (
            <div className="glass highlight spotlight reveal" key={i}><b>0{i + 1}</b><span>{content(highlight, language)}</span></div>
          ))}
        </div>
      </section>

      <section id="projects" data-reveal>
        <SectionHeading number="02" label={label(language, 'ผลงานของทีม', 'GROUP PROJECTS')} className="reveal">{label(language, 'ผลงานที่ทำร่วมกัน', 'Group Projects')}</SectionHeading>
        <div className="grid2">
          {groupProjects.map((p) => <ProjectCard key={p.id} p={p} language={language} />)}
        </div>
      </section>

      <section id="members" data-reveal>
        <SectionHeading number="03" label={label(language, 'สมาชิกในทีม', 'OUR MEMBERS')} className="reveal">{label(language, 'สมาชิก', 'Our Members')}</SectionHeading>
        <div className="grid2 member-grid">
          {members.map((m, i) => (
            <a href={`#/member/${m.id}`} className="glass member spotlight reveal tilt-card" key={m.id} style={{ '--c': COLORS[i % COLORS.length] }}>
              <MemberAvatar member={m} language={language} />
              <h3>{m.name} <small>({m.nickname})</small></h3>
              <span className="cls">✦ {getMemberClass(m, i, language)}</span>
              <p className="role">{content(m.role, language)}</p>
              {m.bio && <p>{content(m.bio, language)}</p>}
              <div className="chips">{m.skills.map((skill) => <span key={skill}>{content(skill, language)}</span>)}</div>
              <h4>{label(language, 'ผลงาน', 'Projects')}</h4>
              {m.projects.map((p) => <ProjectCard key={p.id} p={p} small language={language} />)}
              <span className="more">{label(language, 'ดูโปรไฟล์เต็ม →', 'View full profile →')}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="contact" data-reveal>
        <SectionHeading number="04" label={label(language, 'ติดต่อเรา', 'GET IN TOUCH')} className="reveal">{label(language, 'ติดต่อเรา', 'Get in Touch')}</SectionHeading>
        <div className="contacts">
          {members.filter((m) => m.email).map((m) => (
            <a className="glass spotlight reveal" href={`mailto:${m.email}`} key={`${m.id}-email`}>✉️ {m.name}<br />{m.email}</a>
          ))}
        </div>
      </section>
      <footer>© {new Date().getFullYear()} {team.name}</footer>
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

function ProjectCard({ p, small, language }) {
  const cover = p.title.startsWith('Chat AI พร้อม Portfolio')
    ? `${import.meta.env.BASE_URL}P4.jpg`
    : null;
  const body = (
    <>
      {!small && (
        <div className="project-cover">
          {cover ? <img src={cover} alt={label(language, `ภาพตัวอย่าง ${p.title}`, `Preview of ${content(p.title, language)}`)} /> : <span aria-hidden="true">✦</span>}
        </div>
      )}
      <b>{content(p.title, language)}</b>
      {p.description && <span>{content(p.description, language)}</span>}
      {p.tech?.length > 0 && <div className="chips">{p.tech.map((tech) => <span key={tech}>{content(tech, language)}</span>)}</div>}
    </>
  );
  const cls = `project ${small ? 'small' : 'glass'} spotlight reveal`;
  return p.url && !small ? <a className={cls} href={p.url} target="_blank" rel="noreferrer">{body}</a> : <div className={cls}>{body}</div>;
}
