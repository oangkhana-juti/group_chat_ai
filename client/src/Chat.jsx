import { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  'ทีมนี้เก่งเรื่องอะไรบ้าง?',
  'แนะนำสมาชิกทุกคนหน่อย',
  'ใครเหมาะกับงานออกแบบ UI?',
  'ผลงานที่ทำร่วมกันมีอะไรบ้าง?',
  'ติดต่อทีมได้ทางไหน?',
];

function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('sessionId', id); }
  return id;
}

export default function Chat() {
  const [sessionId, setSessionId] = useState(getSessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottom = useRef(null);

  // รับคำถามที่ส่งมาจากหน้า Member (ถาม AI เกี่ยวกับคนนี้)
  useEffect(() => {
    const pre = sessionStorage.getItem('prefill');
    if (pre) { sessionStorage.removeItem('prefill'); setInput(pre); }
  }, []);

  useEffect(() => {
    fetch(`/api/chat/${sessionId}`).then((r) => r.json()).then(setMessages).catch(() => {});
  }, [sessionId]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send(text) {
    const message = text.trim();
    if (!message || loading) return;
    setError(''); setInput(''); setLoading(true);
    setMessages((m) => [...m, { role: 'user', content: message }]);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'ส่งข้อความไม่สำเร็จ');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      // ไม่เสียข้อความที่พิมพ์: คืนกลับไปที่ช่องกรอกให้กดส่งซ้ำได้
      setInput(message);
      setMessages((m) => m.slice(0, -1));
      setError(e instanceof TypeError ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' : e.message);
    } finally { setLoading(false); }
  }

  function newChat() {
    const id = crypto.randomUUID();
    localStorage.setItem('sessionId', id);
    setSessionId(id); setMessages([]); setError('');
  }

  return (
    <main className="chat glass">
      <header>
        <div><b>🤖 TeamFolio AI</b><small>ตอบจากข้อมูลของทีมเท่านั้น</small></div>
        <button className="ghost" onClick={newChat}>+ แชตใหม่</button>
      </header>

      <div className="msgs">
        {messages.length === 0 && (
          <div className="empty">
            <p>👋 สวัสดี! ลองถามเกี่ยวกับทีมหรือสมาชิกได้เลย</p>
            <div className="chips big">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`row ${m.role}`}>
            <span className="who">{m.role === 'user' ? '🧑' : '🤖'}</span>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="row assistant"><span className="who">🤖</span>
            <div className="bubble typing"><i /><i /><i /></div></div>
        )}
        {error && <p className="err">⚠️ {error}</p>}
        <div ref={bottom} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000}
               placeholder="พิมพ์คำถามของคุณ…" disabled={loading} />
        <button className="btn" disabled={loading || !input.trim()}>ส่ง ➤</button>
      </form>
    </main>
  );
}
