import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Svg from './Svg.jsx';
import { logo } from '../assets/svg.js';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [['/', 'Beranda'], ['/cari', 'Cari Pendonor'], ['/permintaan', 'Permintaan'], ['/dashboard', 'Kelola Data']];

export default function Nav({ urgent }) {
  const { user } = useAuth();
  const navRef = useRef(null);
  const dropRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [desk, setDesk] = useState(() => matchMedia('(min-width:768px)').matches);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setPinned(false); setOpen(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => { const s = scrollY > 40; setScrolled(s); if (!s) setPinned(false); };
    const mq = matchMedia('(min-width:768px)');
    const onMq = () => setDesk(mq.matches);
    const onKey = (e) => { if (e.key === 'Escape') { setPinned(false); setOpen(false); } };
    const onDown = (e) => {
      if (!navRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) { setPinned(false); setOpen(false); }
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    mq.addEventListener('change', onMq);
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onDown);
    return () => {
      removeEventListener('scroll', onScroll); mq.removeEventListener('change', onMq);
      removeEventListener('keydown', onKey); removeEventListener('pointerdown', onDown);
    };
  }, []);

  const compact = desk && scrolled && !pinned;
  const reveal = () => compact && setPinned(true);
  const inert = compact ? '' : undefined;

  return (
    <header>
      <nav id="nav" ref={navRef} data-s={compact ? 'compact' : 'open'}
        role={compact ? 'button' : undefined} tabIndex={compact ? 0 : undefined}
        aria-label={compact ? 'Buka menu navigasi' : 'Navigasi utama'}
        onClick={reveal}
        onKeyDown={(e) => { if (compact && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); reveal(); } }}>
        <div className="row">
          <Link className="logo" to="/" aria-label="SADA, ke beranda"><Svg markup={logo} /></Link>
          <ul className="nl" id="nl" inert={inert}>
            {LINKS.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>
                {to === '/permintaan' && urgent > 0 && <span className="dot" title="Ada permintaan darurat" />}
              </li>
            ))}
            <li>
              {user ? (
                <NavLink to="/profil" className={({ isActive }) => (isActive ? 'on' : '')}>
                  👤 {user.name.split(' ')[0]}
                </NavLink>
              ) : (
                <NavLink to="/masuk" className={({ isActive }) => (isActive ? 'on' : '')}>
                  Masuk
                </NavLink>
              )}
            </li>
          </ul>
          <Link className="cta" to="/buat" inert={inert}>Buat Permintaan</Link>
          <button className="burger" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? '✕' : '☰'}</button>
        </div>
      </nav>
      <div id="drop" ref={dropRef} className={open ? 'show' : ''}>
        {LINKS.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        {user ? (
          <Link to="/profil">👤 Akun Saya ({user.name})</Link>
        ) : (
          <Link to="/masuk">Masuk / Daftar Pendonor</Link>
        )}
        <Link className="cta" to="/buat">Buat Permintaan</Link>
      </div>
    </header>
  );
}
