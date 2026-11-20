import { useEffect, useRef, useState } from 'react';

export default function TypedText({ text, onComplete, speed = 12 }) {
  const [visibleText, setVisibleText] = useState('');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisibleText(text);
      onCompleteRef.current?.();
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        onCompleteRef.current?.();
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);

  return (
    <span aria-label={text}>
      <span aria-hidden="true">{visibleText}</span>
      {visibleText.length < text.length && <span className="typing-cursor" aria-hidden="true">▍</span>}
    </span>
  );
}
