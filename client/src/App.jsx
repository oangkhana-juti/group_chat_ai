import { useCallback, useEffect, useState } from 'react';
import Portfolio from './Portfolio.jsx';
import MemberPage from './MemberPage.jsx';
import Chat from './Chat.jsx';
import { label } from './i18n.js';
import { apiUrl } from './api.js';
import IntroGate from './IntroGate.jsx';

// hash routing: #/  |  #/member/:id  |  #/chat
function parse() {
  const h = location.hash.replace(/^#/, '') || '/';
  const section = h.match(/^\/section\/(about|projects|members|contact)$/);
  if (section) return { page: 'home', section: section[1] };
  const m = h.match(/^\/member\/(\d+)/);
  if (m) return { page: 'member', id: Number(m[1]) };
  return { page: h.startsWith('/chat') ? 'chat' : 'home' };
}

export default function App({ initiallyOpen }) {
  const [route, setRoute] = useState(parse);
  const [activeSection, setActiveSection] = useState(() => parse().section || null);
  const [teamName, setTeamName] = useState('Do Ra E Mo Nueng');
  const [introReplay, setIntroReplay] = useState(0);
  const [stars] = useState(() => Array.from({ length: 60 }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${2 + Math.random() * 3}px`,
    duration: `${2 + Math.random() * 4}s`,
    delay: `${Math.random() * -6}s`,
  })));
  const [language, setLanguage] = useState(() => localStorage.getItem('language') === 'en' ? 'en' : 'th');
  const [theme, setTheme] = useState(() => {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('theme');
    } catch (error) {
      console.error('Could not read the saved theme preference.', error);
    }
    return savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    let active = true;
    fetch(apiUrl('/api/portfolio'))
      .then((response) => {
        if (!response.ok) throw new Error(`Portfolio request failed (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (active && typeof data.team?.name === 'string') setTeamName(data.team.name);
      })
      .catch((error) => {
        console.error('Could not load the team name for navigation.', error);
        fetch(`${import.meta.env.BASE_URL}portfolio.json`)
          .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Portfolio fallback request failed (${response.status}).`)))
          .then((data) => {
            if (active && typeof data.team?.name === 'string') setTeamName(data.team.name);
          })
          .catch((fallbackError) => console.error('Could not load the fallback team name.', fallbackError));
      });
    return () => { active = false; };
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Could not save the theme preference.', error);
    }
  }, [theme]);
  useEffect(() => {
    const onHash = () => {
      const nextRoute = parse();
      setRoute(nextRoute);
      setActiveSection(nextRoute.section || null);
      if (!nextRoute.section) window.scrollTo(0, 0);
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const { page } = route;
  const logoParts = teamName.trim().split(/\s+/);
  const logoTail = teamName ? logoParts.pop() : '';
  const logoPrefix = logoParts.join(' ');

  useEffect(() => {
    if (page !== 'home') return undefined;

    let frame = 0;
    const updateActiveSection = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const navBottom = document.querySelector('.nav')?.getBoundingClientRect().bottom || 0;
        const activationLine = navBottom + 40;
        let currentSection = null;
        for (const section of ['about', 'projects', 'members', 'contact']) {
          const element = document.getElementById(section);
          if (element && element.getBoundingClientRect().top <= activationLine) currentSection = section;
        }
        setActiveSection(currentSection);
      });
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [page]);

  function toggleLanguage() {
    const nextLanguage = language === 'th' ? 'en' : 'th';
    localStorage.setItem('language', nextLanguage);
    setLanguage(nextLanguage);
  }

  function toggleTheme() {
    setTheme((current) => current === 'dark' ? 'light' : 'dark');
  }

  const scrollToFeature = useCallback((section) => {
    const target = document.getElementById(section);
    if (!target) return;
    const navHeight = document.querySelector('.nav')?.getBoundingClientRect().height || 0;
    let targetTop = 0;
    for (let element = target; element; element = element.offsetParent) targetTop += element.offsetTop;
    const top = Math.max(0, targetTop - navHeight + 15);
    window.scrollTo({
      top,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, []);

  function scrollToSection(event, section) {
    if (location.hash !== `#/section/${section}`) return;
    event.preventDefault();
    scrollToFeature(section);
  }

  function scrollHomeToTop(event) {
    if (location.hash !== '#/') return;
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  return (
    <>
      <IntroGate
        teamName={teamName}
        language={language}
        initiallyOpen={initiallyOpen}
        replayKey={introReplay}
      />
      <div className="magic-field" aria-hidden="true">
        {stars.map((star, index) => (
          <i
            key={index}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              '--spark-duration': star.duration,
              '--spark-delay': star.delay,
            }}
          />
        ))}
        <span className="moon moon-main" />
        <span className="moon moon-small" />
      </div>
      <div className="magic-aura" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <nav className="nav">
        <a href="#/" className="logo" onClick={scrollHomeToTop}>
          <span className="logo-mark" aria-hidden="true">◐</span>
          {teamName
            ? <span className="logo-name">{logoPrefix ? `${logoPrefix} ` : ''}<span>{logoTail}</span></span>
            : <span className="logo-name">Do Ra E Mo Song</span>}
        </a>
        <div className="nav-menu">
          <div className="nav-links">
            <a href="#/" onClick={scrollHomeToTop} className={!activeSection && page !== 'chat' ? 'active' : ''}>{label(language, 'หน้าหลัก', 'Homepage')}</a>
            <a href="#/section/about" onClick={(event) => scrollToSection(event, 'about')} className={activeSection === 'about' ? 'active' : ''}>{label(language, 'เกี่ยวกับทีม', 'About our team')}</a>
            <a href="#/section/projects" onClick={(event) => scrollToSection(event, 'projects')} className={activeSection === 'projects' ? 'active' : ''}>{label(language, 'ผลงานของทีม', 'Group projects')}</a>
            <a href="#/section/members" onClick={(event) => scrollToSection(event, 'members')} className={activeSection === 'members' ? 'active' : ''}>{label(language, 'สมาชิกในทีม', 'Our members')}</a>
            <a href="#/section/contact" onClick={(event) => scrollToSection(event, 'contact')} className={activeSection === 'contact' ? 'active' : ''}>{label(language, 'ติดต่อเรา', 'Get in touch')}</a>
            <a href="#/chat" className={page === 'chat' ? 'active' : ''}>{label(language, '💬 คุยกับ AI', '💬 AI Chat')}</a>
          </div>
          <div className="nav-actions">
            <button
              className="intro-toggle"
              onClick={() => setIntroReplay((current) => current + 1)}
              aria-label={label(language, 'เล่นฉากเปิดอีกครั้ง', 'Replay the intro')}
              title={label(language, 'เล่นฉากเปิดอีกครั้ง', 'Replay the intro')}
            >✦</button>
            <button className="language-toggle" onClick={toggleLanguage} aria-label={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}>
              {language === 'th' ? 'EN' : 'ไทย'}
            </button>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={label(language, theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
              aria-pressed={theme === 'dark'}
            >◑</button>
          </div>
        </div>
      </nav>
      {page === 'chat'
        ? <Chat language={language} />
        : page === 'member'
          ? <MemberPage id={route.id} language={language} />
          : <Portfolio language={language} section={route.section} onScrollToSection={scrollToFeature} />}
    </>
  );
}
