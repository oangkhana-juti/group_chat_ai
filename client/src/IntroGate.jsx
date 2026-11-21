import { useEffect, useRef, useState } from 'react';
import { label } from './i18n.js';

const SESSION_KEY = 'magicWorldIntroSeen';

export function prepareIntro() {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') return false;
  } catch (error) {
    console.warn('Could not read the intro session preference; showing the intro.', error);
  }
  document.documentElement.classList.add('intro-active');
  return true;
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } catch (error) {
    console.warn('Could not save the intro session preference.', error);
  }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function makeStars(count) {
  return Array.from({ length: count }, () => ({
    left: `${randomBetween(0, 100)}%`,
    top: `${randomBetween(0, 100)}%`,
    size: `${randomBetween(2, 5)}px`,
    duration: `${randomBetween(2, 6)}s`,
    delay: `${randomBetween(0, 5)}s`,
  }));
}

function releasePageMotion() {
  document.documentElement.classList.remove('intro-active');
  window.dispatchEvent(new Event('intro:release'));
}

export default function IntroGate({ teamName, language, initiallyOpen, replayKey }) {
  const [visible, setVisible] = useState(initiallyOpen);
  const [phase, setPhase] = useState('ready');
  const [burst, setBurst] = useState([]);
  const [stars] = useState(() => makeStars(90));
  const castButton = useRef(null);
  const timers = useRef([]);
  const lastReplayKey = useRef(replayKey);
  const previousFocus = useRef(null);
  const previousOverflow = useRef('');
  const previousRootOverflow = useRef('');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearTimers() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  function enterImmediately() {
    markIntroSeen();
    clearTimers();
    setPhase('opening');
    setVisible(false);
    releasePageMotion();
  }

  function castSpell() {
    if (phase !== 'ready') return;
    if (reducedMotion) {
      enterImmediately();
      return;
    }

    markIntroSeen();
    const particles = Array.from({ length: 36 }, (_, index) => {
      const angle = (index / 36) * Math.PI * 2 + randomBetween(-0.08, 0.08);
      const distance = randomBetween(120, 420);
      return {
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance}px`,
        size: `${randomBetween(8, 22)}px`,
        delay: `${randomBetween(0, 0.25)}s`,
      };
    });
    setBurst(particles);
    setPhase('casting');
    timers.current.push(window.setTimeout(() => {
      setPhase('opening');
      releasePageMotion();
    }, 1000));
    timers.current.push(window.setTimeout(() => {
      setVisible(false);
    }, 2800));
  }

  useEffect(() => {
    if (lastReplayKey.current === replayKey) return;
    lastReplayKey.current = replayKey;
    clearTimers();
    setBurst([]);
    setPhase('ready');
    document.documentElement.classList.add('intro-active');
    window.dispatchEvent(new Event('intro:pause'));
    window.scrollTo(0, 0);
    setVisible(true);
  }, [replayKey]);

  useEffect(() => {
    if (!visible) return undefined;
    previousFocus.current = document.activeElement;
    previousOverflow.current = document.body.style.overflow;
    previousRootOverflow.current = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    castButton.current?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        enterImmediately();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const skipButton = document.querySelector('.intro-skip');
        if (event.shiftKey) skipButton?.focus();
        else castButton.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow.current;
      document.documentElement.style.overflow = previousRootOverflow.current;
      if (previousFocus.current instanceof HTMLElement && previousFocus.current.isConnected) {
        previousFocus.current.focus();
      }
    };
  }, [visible]);

  useEffect(() => () => clearTimers(), []);

  if (!visible) return null;

  return (
    <div
      className={`intro-gate${phase === 'casting' ? ' is-casting' : ''}${phase === 'opening' ? ' is-opening' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label(language, 'ฉากเปิดเข้าสู่โลกเวทมนตร์', 'Intro to the magic world')}
    >
      <div className="intro-sky" aria-hidden="true">
        {stars.map((star, index) => (
          <i
            key={index}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              '--twinkle-duration': star.duration,
              '--twinkle-delay': `${star.delay}`,
            }}
          />
        ))}
      </div>
      <i className="intro-shooting-star" aria-hidden="true" />
      <i className="intro-shooting-star second" aria-hidden="true" />
      <div className="intro-moon" aria-hidden="true" />
      <div className="intro-rune-wrap" aria-hidden="true">
        <svg className="intro-rune" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="2">
          <g className="rune-outer">
            <circle cx="150" cy="150" r="142" />
            <circle cx="150" cy="150" r="130" strokeWidth="7" strokeDasharray="2 13" />
            <polygon points="150,22 261,214 39,214" />
            <polygon points="150,278 39,86 261,86" />
          </g>
          <g className="rune-inner">
            <circle cx="150" cy="150" r="84" />
            <circle cx="150" cy="150" r="72" strokeDasharray="10 6" />
            <polygon points="150,92 200,178 100,178" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
      <div className="intro-copy">
        <p>{label(language, 'ยินดีต้อนรับสู่โลกเวทมนตร์ของ', 'Welcome to the magic world of')}</p>
        {teamName
          ? <h1>{teamName}</h1>
          : <p className="intro-team-loading" role="status">{label(language, 'กำลังโหลดชื่อทีม…', 'Loading team name…')}</p>}
        <button ref={castButton} className="btn intro-cast" onClick={castSpell}>
          {reducedMotion
            ? label(language, 'เข้าเว็บไซต์', 'Enter website')
            : label(language, '✦ แตะเพื่อร่ายเวท ✦', '✦ Tap to cast ✦')}
        </button>
        <small>{label(language, 'กด Esc หรือ “ข้าม” เพื่อเข้าเว็บทันที', 'Press Esc or Skip to enter right away')}</small>
      </div>
      {burst.length > 0 && (
        <div className="intro-burst" aria-hidden="true">
          {burst.map((particle, index) => (
            <i
              key={index}
              style={{
                '--burst-x': particle.dx,
                '--burst-y': particle.dy,
                '--burst-size': particle.size,
                '--burst-delay': particle.delay,
              }}
            />
          ))}
        </div>
      )}
      <button className="intro-skip" onClick={enterImmediately}>
        {label(language, 'ข้าม ›', 'Skip ›')}
      </button>
    </div>
  );
}
