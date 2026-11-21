import { useEffect, useRef, useState } from 'react';
import { apiUrl } from './api.js';
import { content, label } from './i18n.js';
import { findLocalAnswer } from './localAnswer.js';
import TypedText from './TypedText.jsx';

const SUGGESTIONS = {
  th: [
    'ทีมนี้เก่งเรื่องอะไรบ้าง?',
    'แนะนำสมาชิกทุกคนหน่อย',
    'ใครเหมาะกับงานออกแบบ UI?',
    'ผลงานที่ทำร่วมกันมีอะไรบ้าง?',
    'ติดต่อทีมได้ทางไหน?',
  ],
  en: [
    'What does the team specialize in?',
    'Introduce all team members.',
    'Who is best suited for UI design?',
    'What projects has the team built together?',
    'How can I contact the team?',
  ],
};

function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('sessionId', id); }
  return id;
}

function historyKey(sessionId) {
  return `chatHistory:${sessionId}`;
}

function readHistory(sessionId) {
  try {
    const history = JSON.parse(localStorage.getItem(historyKey(sessionId)) || '[]');
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveHistory(sessionId, messages) {
  localStorage.setItem(historyKey(sessionId), JSON.stringify(messages.map(({ role, content: message }) => ({ role, content: message }))));
}

function sessionsKey() {
  return 'chatSessions';
}

function readSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem(sessionsKey()) || '[]');
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function saveSession(sessionId, messages) {
  const firstQuestion = messages.find((message) => message.role === 'user')?.content;
  const sessions = readSessions().filter((session) => session.id !== sessionId);
  if (firstQuestion) {
    sessions.unshift({
      id: sessionId,
      title: firstQuestion,
      updatedAt: new Date().toISOString(),
      messageCount: messages.length,
    });
  }
  localStorage.setItem(sessionsKey(), JSON.stringify(sessions));
}

function mergeMessages(localMessages, serverMessages) {
  if (!Array.isArray(localMessages) || localMessages.length === 0) {
    return Array.isArray(serverMessages) ? serverMessages : [];
  }
  if (!Array.isArray(serverMessages) || serverMessages.length === 0) {
    return localMessages;
  }

  const merged = [...serverMessages];
  const serverKeys = new Set(serverMessages.map((message) => `${message.role}:${message.content}`));
  for (const message of localMessages) {
    const key = `${message.role}:${message.content}`;
    if (!serverKeys.has(key)) merged.push(message);
  }
  return merged;
}

function removeSession(sessionId) {
  const sessions = readSessions().filter((session) => session.id !== sessionId);
  localStorage.setItem(sessionsKey(), JSON.stringify(sessions));
  localStorage.removeItem(historyKey(sessionId));
}

function mergeSessions(localSessions, serverSessions) {
  const merged = new Map();
  for (const session of [...localSessions, ...serverSessions]) {
    const existing = merged.get(session.id);
    if (!existing) {
      merged.set(session.id, session);
      continue;
    }
    merged.set(session.id, {
      ...existing,
      ...session,
      title: session.title || existing.title,
      updatedAt: session.updatedAt > existing.updatedAt ? session.updatedAt : existing.updatedAt,
    });
  }
  return [...merged.values()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export default function Chat({ language }) {
  const [sessionId, setSessionId] = useState(getSessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [sessions, setSessions] = useState(readSessions);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const bottom = useRef(null);

  function refreshSessions() {
    const localSessions = readSessions();
    setSessions(localSessions);
    fetch(apiUrl('/api/chat/sessions'))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((serverSessions) => {
        if (!Array.isArray(serverSessions)) return;
        const mergedSessions = mergeSessions(readSessions(), serverSessions);
        localStorage.setItem(sessionsKey(), JSON.stringify(mergedSessions));
        setSessions(mergedSessions);
      })
      .catch(() => {
        setSessions(localSessions);
      });
  }

  useEffect(() => {
    refreshSessions();
  }, []);

  // รับคำถามที่ส่งมาจากหน้า Member (ถาม AI เกี่ยวกับคนนี้)
  useEffect(() => {
    const pre = sessionStorage.getItem('prefill');
    if (pre) { sessionStorage.removeItem('prefill'); setInput(pre); }
  }, []);

  useEffect(() => {
    let active = true;
    fetch(apiUrl(`/api/chat/${sessionId}`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((serverMessages) => {
        if (!active) return;
        const localMessages = readHistory(sessionId);
        const mergedMessages = mergeMessages(localMessages, serverMessages);
        setMessages(mergedMessages);
        saveHistory(sessionId, mergedMessages);
        saveSession(sessionId, mergedMessages);
        setSessions(readSessions());
      })
      .catch(() => {
        if (active) {
          const localMessages = readHistory(sessionId);
          setMessages(localMessages);
          saveSession(sessionId, localMessages);
          setSessions(readSessions());
        }
      });
    return () => { active = false; };
  }, [sessionId]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  function appendAssistantMessage(reply) {
    const id = crypto.randomUUID();
    setTypingMessageId(id);
    setMessages((currentMessages) => {
      const next = [...currentMessages, { id, role: 'assistant', content: reply }];
      saveHistory(sessionId, next);
      saveSession(sessionId, next);
      refreshSessions();
      return next;
    });
  }

  async function send(text) {
    const message = text.trim();
    if (!message || loading) return;
    setError(''); setInput(''); setLoading(true);
    setMessages((m) => {
      const next = [...m, { role: 'user', content: message }];
      saveHistory(sessionId, next);
      saveSession(sessionId, next);
      setSessions(readSessions());
      return next;
    });
    try {
      const r = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'ส่งข้อความไม่สำเร็จ');
      appendAssistantMessage(data.reply);
    } catch (e) {
      try {
        const r = await fetch(`${import.meta.env.BASE_URL}portfolio.json`);
        if (!r.ok) throw new Error();
        const portfolio = await r.json();
        const reply = findLocalAnswer(portfolio, message, language);
        appendAssistantMessage(reply);
      } catch {
        setInput(message);
        setMessages((m) => m.slice(0, -1));
        setError(e instanceof TypeError
          ? label(language, 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', 'Could not connect to the server. Check your connection and try again.')
          : e.message);
      }
    } finally { setLoading(false); }
  }

  function newChat() {
    const id = crypto.randomUUID();
    localStorage.setItem('sessionId', id);
    setSessionId(id); setMessages([]); setError('');
    refreshSessions();
  }

  function openSession(id) {
    localStorage.setItem('sessionId', id);
    setSessionId(id);
    setMessages(readHistory(id));
    setHistoryOpen(false);
  }

  async function deleteSession(id) {
    try {
      const r = await fetch(apiUrl(`/api/chat/${encodeURIComponent(id)}`), { method: 'DELETE' });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || 'ลบประวัติไม่สำเร็จ');
      }
    } catch (e) {
      setError(e instanceof TypeError
        ? label(language, 'ลบประวัติบนเซิร์ฟเวอร์ไม่ได้ แต่ลบประวัตินี้ออกจากเครื่องแล้ว', 'Could not delete server history, but removed it from this device.')
        : e.message);
    } finally {
      removeSession(id);
      setSessions(readSessions());
      refreshSessions();
      if (id === sessionId) newChat();
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const messages = readHistory(session.id);
    const searchable = [session.title, ...messages.map((message) => message.content)]
      .join(' ')
      .toLowerCase();
    return searchable.includes(historyQuery.trim().toLowerCase());
  });

  return (
    <main className="chat glass">
      {historyOpen && (
        <button className="history-backdrop" aria-label={label(language, 'ปิดประวัติ', 'Close history')} onClick={() => setHistoryOpen(false)} />
      )}
      <aside className={`history-panel${historyOpen ? ' open' : ''}`} aria-hidden={!historyOpen}>
        <div className="history-heading">
          <b>{label(language, 'ประวัติการค้นหา', 'Chat History')}</b>
          <button className="ghost" onClick={() => setHistoryOpen(false)}>{label(language, 'ปิด', 'Close')}</button>
        </div>
        <input
          className="history-search"
          value={historyQuery}
          onChange={(event) => setHistoryQuery(event.target.value)}
          placeholder={label(language, 'ค้นหาในประวัติ...', 'Search history...')}
        />
        <div className="history-list">
          {filteredSessions.map((session) => (
            <div className={`history-item${session.id === sessionId ? ' active' : ''}`} key={session.id}>
              <button className="history-open" onClick={() => openSession(session.id)}>
                <b>{session.title}</b>
                <small>
                  {session.messageCount} {label(language, 'ข้อความ', 'messages')} · {new Date(session.updatedAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                </small>
              </button>
              <button
                className="history-delete"
                aria-label={label(language, `ลบประวัติ ${session.title}`, `Delete history ${session.title}`)}
                onClick={() => deleteSession(session.id)}
              >×</button>
            </div>
          ))}
          {filteredSessions.length === 0 && (
            <p className="history-empty">{label(language, 'ไม่พบประวัติการค้นหา', 'No chat history found.')}</p>
          )}
        </div>
      </aside>
      <header>
        <div><b><span className="chat-sigil" aria-hidden="true">✦</span> {label(language, 'ผู้ช่วยเวทมนตร์ของทีม', 'Team Spellbook AI')}</b><small>{label(language, 'ตอบจากข้อมูลของทีมเท่านั้น', 'Answers based on team information')}</small></div>
        <div className="chat-actions">
          <button className="ghost" onClick={() => setHistoryOpen(true)}>{label(language, 'ประวัติ', 'History')}</button>
          <button className="ghost" onClick={newChat}>{label(language, '+ แชตใหม่', '+ New chat')}</button>
        </div>
      </header>

      <div className="msgs">
        {messages.length === 0 && (
          <div className="empty">
            <p>{label(language, 'ยินดีต้อนรับ! ลองถามเกี่ยวกับทีมหรือสมาชิกได้เลย', 'Welcome! Ask me about the team or its members.')}</p>
            <div className="chips big">
              {SUGGESTIONS[language].map((suggestion) => <button className="magnetic" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} className={`row ${m.role}`}>
            <span className="who" aria-hidden="true">{m.role === 'user' ? '◐' : '✦'}</span>
            <div className="bubble">
              {m.id === typingMessageId
                ? <TypedText text={m.content} onComplete={() => setTypingMessageId((current) => current === m.id ? null : current)} />
                : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="row assistant"><span className="who" aria-hidden="true">✦</span>
            <div className="bubble typing"><i /><i /><i /></div></div>
        )}
        {error && <p className="err">⚠️ {error}</p>}
        <div ref={bottom} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000}
               placeholder={label(language, 'พิมพ์คำถามของคุณ…', 'Type your question…')} disabled={loading} />
        <button className="btn magnetic" disabled={loading || !input.trim()}>{label(language, 'ส่ง ➤', 'Send ➤')}</button>
      </form>
    </main>
  );
}
