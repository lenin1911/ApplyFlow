import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from './services/firebase';
import {
  signInWithGithub,
  signInWithGoogle,
  sendEmailLink,
  completeEmailLinkSignIn,
  auth,
} from './services/firebase';

const seedApplications = [
  { id: 1, company: 'Linear', role: 'Product Designer', date: 'Sep 12, 2024', status: 'Interview', mark: 'L', tone: 'violet' },
  { id: 2, company: 'Notion', role: 'Product Manager', date: 'Sep 08, 2024', status: 'Applied', mark: 'N', tone: 'ink' },
  { id: 3, company: 'Vercel', role: 'Frontend Engineer', date: 'Sep 05, 2024', status: 'Offer', mark: 'V', tone: 'slate' },
  { id: 4, company: 'Arcade', role: 'Brand Designer', date: 'Aug 29, 2024', status: 'Rejected', mark: 'A', tone: 'orange' },
];

const Icon = ({ name, size = 20 }) => {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    briefcase: 'M4 7h16v13H4zM8 7V5h8v2M2 11h20',
    calendar: 'M5 4v3M19 4v3M4 7h16v13H4zM8 12h3M8 16h3M14 12h3',
    chart: 'M4 19V5M4 19h17M8 16v-4M12 16V8M16 16v-6M20 16v-9',
    settings: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.5v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V13h-.1a1.7 1.7 0 0 0-1.5 1z',
    plus: 'M12 5v14M5 12h14',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    search: 'm20 20-4-4M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4z',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    check: 'm5 12 4 4L19 6',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
};

function Brand({ dark = false }) {
  return <div className={`brand ${dark ? 'brand-dark' : ''}`}><span className="brand-mark"><span /><span /><span /></span><span>applyflow</span></div>;
}

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAuth = async (provider, fn) => {
    setLoading(true); setStatus({ type: 'info', text: `Connecting to ${provider}…` });
    try { const user = await fn(); onAuthSuccess(user); }
    catch (error) { setStatus({ type: 'error', text: error.code === 'auth/popup-closed-by-user' ? 'Sign-in window was closed.' : 'Unable to connect right now. Please try again.' }); }
    finally { setLoading(false); }
  };

  const submitEmail = async (event) => {
    event.preventDefault(); if (!email || loading) return;
    setLoading(true); setStatus({ type: 'info', text: 'Sending your secure sign-in link…' });
    try { await sendEmailLink(email.trim()); setStatus({ type: 'success', text: `Check ${email.trim()} for your secure link.` }); }
    catch (error) { setStatus({ type: 'error', text: error.code === 'auth/invalid-email' ? 'Enter a valid email address.' : 'Email sign-in is not available right now.' }); }
    finally { setLoading(false); }
  };

  return <main className="auth-page">
    <section className="auth-visual">
      <div className="visual-top"><Brand dark /><span className="visual-label">CAREER OS / 01</span></div>
      <div className="visual-copy"><p className="eyebrow light">A calmer way to get hired</p><h1>Make your next<br /><em>move</em> count.</h1><p className="visual-description">One clear space for every application, conversation, and opportunity on your way to work you love.</p></div>
      <div className="visual-footer"><span>© 2024 APPLYFLOW</span><span>BUILT FOR THE AMBITIOUS</span></div>
      <div className="orb orb-one" /><div className="orb orb-two" />
    </section>
    <section className="auth-panel">
      <div className="auth-panel-inner"><div className="mobile-brand"><Brand /></div><div className="auth-heading"><p className="eyebrow">WELCOME TO APPLYFLOW</p><h2>{mode === 'login' ? 'Good to see you again.' : 'Start your next chapter.'}</h2><p>{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create your free workspace in a few seconds.'}</p></div>
        <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setStatus(null); }}>Log in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setStatus(null); }}>Sign up</button></div>
        <form className="auth-form" onSubmit={submitEmail}>{mode === 'signup' && <label>YOUR NAME<input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" required /></label>}<label>EMAIL ADDRESS<div className="input-wrap"><span>@</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div></label><button className="primary-button" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Continue with email' : 'Create workspace'}<Icon name="arrow" size={18} /></button></form>
        <div className="or-line"><span>OR CONTINUE WITH</span></div><div className="social-row"><button onClick={() => runAuth('Google', signInWithGoogle)} disabled={loading}><b>G</b> Google</button><button onClick={() => runAuth('GitHub', signInWithGithub)} disabled={loading}><b>⌘</b> GitHub</button></div>
        {status && <div className={`status ${status.type}`}>{status.type === 'success' && <Icon name="check" size={15} />}{status.text}</div>}<p className="terms">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
      </div>
    </section>
  </main>;
}

function Dashboard({ user, onSignOut }) {
  const [applications, setApplications] = useState(seedApplications);
  const [activeNav, setActiveNav] = useState('Overview');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const visibleApps = useMemo(() => applications.filter(a => `${a.company} ${a.role}`.toLowerCase().includes(query.toLowerCase())), [applications, query]);
  const counts = { total: applications.length, interview: applications.filter(a => a.status === 'Interview').length, offer: applications.filter(a => a.status === 'Offer').length, applied: applications.filter(a => a.status === 'Applied').length };
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Alex';
  const addApplication = e => { e.preventDefault(); if (!newCompany.trim()) return; setApplications([{ id: Date.now(), company: newCompany.trim(), role: 'New opportunity', date: 'Today', status: 'Applied', mark: newCompany.trim()[0].toUpperCase(), tone: 'blue' }, ...applications]); setNewCompany(''); setShowAdd(false); };

  return <div className="dashboard"><aside className="sidebar"><Brand /><div className="side-section"><span className="side-label">WORKSPACE</span>{[['Overview', 'grid'], ['Applications', 'briefcase'], ['Interviews', 'calendar'], ['Insights', 'chart']].map(([label, icon]) => <button key={label} className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)}><Icon name={icon} size={18} />{label}{label === 'Applications' && <span className="nav-count">{counts.total}</span>}</button>)}</div><div className="side-bottom"><button className="nav-item" onClick={() => setActiveNav('Settings')}><Icon name="settings" size={18} />Settings</button><div className="user-card"><div className="avatar">{firstName[0].toUpperCase()}</div><div><strong>{user?.displayName || firstName}</strong><small>{user?.email || 'Personal workspace'}</small></div><button className="signout" onClick={onSignOut} title="Sign out">↗</button></div></div></aside>
    <main className="dashboard-main"><header className="topbar"><div className="mobile-brand"><Brand /></div><div className="topbar-actions"><div className="search"><Icon name="search" size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search applications" /></div><button className="icon-button"><Icon name="bell" size={19} /><i /></button><div className="avatar small">{firstName[0].toUpperCase()}</div></div></header><div className="content"><div className="dashboard-intro"><div><p className="eyebrow">MONDAY, SEPTEMBER 16, 2024</p><h1>Good morning, {firstName}.</h1><p className="intro-sub">Here’s a clear view of your job search this week.</p></div><button className="add-button" onClick={() => setShowAdd(true)}><Icon name="plus" size={18} /> Add application</button></div><section className="stats-grid"><div className="stat-card dark"><span>Total applications</span><strong>{counts.total}</strong><small><b>↑ 18%</b> vs last month</small><div className="sparkline"><span /><span /><span /><span /><span /><span /><span /><span /></div></div><div className="stat-card"><span>In progress</span><strong>{counts.applied + counts.interview}</strong><small><b className="green">2 active</b> this week</small><div className="mini-bar"><i style={{ width: '68%' }} /></div></div><div className="stat-card"><span>Interviews</span><strong>{counts.interview}</strong><small><b className="purple">Next: Thu, 10:30</b></small><div className="mini-dots"><i /><i /><i /><i /><i /></div></div><div className="stat-card"><span>Offers received</span><strong>{counts.offer}</strong><small><b className="orange">Keep going</b> — you’re close</small><div className="offer-line">✦ <span>momentum</span></div></div></section><div className="section-heading"><div><h2>Recent applications</h2><p>Keep your pipeline moving forward.</p></div><button className="view-all" onClick={() => setActiveNav('Applications')}>View all <Icon name="arrow" size={15} /></button></div><section className="table-card"><div className="table-head"><span>COMPANY / ROLE</span><span>APPLIED ON</span><span>STATUS</span><span /></div>{visibleApps.map(app => <div className="application-row" key={app.id}><div className="company-cell"><div className={`company-mark ${app.tone}`}>{app.mark}</div><div><strong>{app.company}</strong><small>{app.role}</small></div></div><span className="date-cell">{app.date}</span><span className={`status-pill ${app.status.toLowerCase()}`}>{app.status}</span><button className="row-more">•••</button></div>)}{visibleApps.length === 0 && <div className="empty-row">No applications match “{query}”.</div>}</section><section className="bottom-grid"><div className="tip-card"><div className="tip-icon">✦</div><div><p className="eyebrow">A LITTLE MOMENTUM</p><h3>You’re building a strong pipeline.</h3><p>People who track their applications are 2× more likely to follow up on time.</p></div><button>Read more <Icon name="arrow" size={15} /></button></div><div className="week-card"><div className="section-heading compact"><div><h2>This week</h2><p>Your upcoming focus</p></div><Icon name="calendar" size={18} /></div><div className="focus-item"><span className="focus-dot purple-dot" /><div><strong>Interview prep</strong><small>Linear · Thursday at 10:30</small></div><span className="focus-arrow">→</span></div><div className="focus-item"><span className="focus-dot orange-dot" /><div><strong>Follow up</strong><small>Notion · Friday morning</small></div><span className="focus-arrow">→</span></div></div></section></div></main>{showAdd && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setShowAdd(false)}><form className="add-modal" onSubmit={addApplication}><button type="button" className="modal-x" onClick={() => setShowAdd(false)}>×</button><p className="eyebrow">NEW OPPORTUNITY</p><h2>Add an application</h2><p>Start a lightweight record and keep the momentum.</p><label>COMPANY NAME<input autoFocus value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="e.g. Figma" required /></label><button className="primary-button">Add to pipeline <Icon name="arrow" size={18} /></button></form></div>}</div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => { completeEmailLinkSignIn().catch(() => null); const unsubscribe = onAuthStateChanged(auth, current => { setUser(current); setChecked(true); }); return unsubscribe; }, []);
  if (!checked) return <div className="loading-screen"><Brand /><span /></div>;
  return user ? <Dashboard user={user} onSignOut={() => signOut(auth)} /> : <AuthScreen onAuthSuccess={setUser} />;
}
