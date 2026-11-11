import { useEffect, useState } from 'react';
import Portfolio from './Portfolio.jsx';
import MemberPage from './MemberPage.jsx';
import Chat from './Chat.jsx';

// hash routing: #/  |  #/member/:id  |  #/chat
function parse() {
  const h = location.hash.replace(/^#/, '') || '/';
  const m = h.match(/^\/member\/(\d+)/);
  if (m) return { page: 'member', id: Number(m[1]) };
  return { page: h.startsWith('/chat') ? 'chat' : 'home' };
}

export default function App() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => { setRoute(parse()); window.scrollTo(0, 0); };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const { page } = route;

  return (
    <>
      <div className="blobs" aria-hidden="true"><i /><i /><i /></div>
      <nav className="nav">
        <a href="#/" className="logo">◐ Team<span>Folio</span></a>
        <div>
          <a href="#/" className={page !== 'chat' ? 'active' : ''}>Portfolio</a>
          <a href="#/chat" className={page === 'chat' ? 'active' : ''}>💬 คุยกับ AI</a>
        </div>
      </nav>
      {page === 'chat' ? <Chat /> : page === 'member' ? <MemberPage id={route.id} /> : <Portfolio />}
    </>
  );
}
