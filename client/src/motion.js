const REVEAL = '[data-reveal], .reveal';
const CARDS = '.spotlight';
const TILT = '.tilt-card';
const MAGNETIC = '.magnetic';

export function bootMotion() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const cleanups = [];
  const revealed = new WeakSet();
  const spotlighted = new WeakSet();
  const tilted = new WeakSet();
  const magnetized = new WeakSet();
  const root = document.documentElement;
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  root.classList.add('motion-ready');

  const revealObserver = !reducedMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    : null;

  function addReveal(element) {
    if (revealed.has(element)) return;
    revealed.add(element);
    element.classList.add('reveal');
    if (!revealObserver) {
      element.classList.add('is-visible');
      return;
    }

    const siblings = Array.from(element.parentElement?.children || [])
      .filter((child) => child.matches(REVEAL));
    const index = Math.max(0, siblings.indexOf(element));
    element.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 70}ms`);
    revealObserver.observe(element);
  }

  function addSpotlight(element) {
    if (reducedMotion || !finePointer || spotlighted.has(element)) return;
    spotlighted.add(element);
    const move = (event) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      element.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    };
    const reset = () => {
      element.style.removeProperty('--pointer-x');
      element.style.removeProperty('--pointer-y');
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', reset);
    cleanups.push(() => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      reset();
    });
  }

  function addTilt(element) {
    if (reducedMotion || !finePointer || tilted.has(element)) return;
    tilted.add(element);
    const move = (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.setProperty('--tilt-x', `${(x * 6).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${(-y * 6).toFixed(2)}deg`);
    };
    const reset = () => {
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', reset);
    cleanups.push(() => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      reset();
    });
  }

  function addMagnetism(element) {
    if (reducedMotion || !finePointer || magnetized.has(element)) return;
    magnetized.add(element);
    const move = (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      element.style.setProperty('--magnet-x', `${(x * 7).toFixed(1)}px`);
      element.style.setProperty('--magnet-y', `${(y * 5).toFixed(1)}px`);
    };
    const reset = () => {
      element.style.removeProperty('--magnet-x');
      element.style.removeProperty('--magnet-y');
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', reset);
    cleanups.push(() => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      reset();
    });
  }

  function enhance(element) {
    if (!(element instanceof Element)) return;
    if (element.matches(REVEAL)) addReveal(element);
    if (element.matches(CARDS)) addSpotlight(element);
    if (element.matches(TILT)) addTilt(element);
    if (element.matches(MAGNETIC)) addMagnetism(element);
    element.querySelectorAll(`${REVEAL}, ${CARDS}, ${TILT}, ${MAGNETIC}`).forEach((child) => {
      if (child.matches(REVEAL)) addReveal(child);
      if (child.matches(CARDS)) addSpotlight(child);
      if (child.matches(TILT)) addTilt(child);
      if (child.matches(MAGNETIC)) addMagnetism(child);
    });
  }

  enhance(document.body);
  const mutationObserver = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(enhance));
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  let scrollFrame = 0;
  const updateScrollEffects = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      document.querySelector('.nav')?.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  };
  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  window.addEventListener('resize', updateScrollEffects, { passive: true });
  updateScrollEffects();

  return () => {
    mutationObserver.disconnect();
    revealObserver?.disconnect();
    window.removeEventListener('scroll', updateScrollEffects);
    window.removeEventListener('resize', updateScrollEffects);
    cleanups.forEach((cleanup) => cleanup());
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    progress.remove();
    root.classList.remove('motion-ready');
  };
}
