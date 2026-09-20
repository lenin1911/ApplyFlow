import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Brand({ dark = false }) {
  return (
    <div className={`brand ${dark ? 'brand-dark' : ''}`}>
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      <span>applyflow</span>
    </div>
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setStatus({ type: 'error', text: 'Please enter a username.' });
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setStatus({ type: 'error', text: 'Password must be at least 6 characters.' });
          setLoading(false);
          return;
        }
        await register(username.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setStatus({
        type: 'error',
        text: err.message || (mode === 'signup' ? 'Registration failed' : 'Invalid email or password'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="visual-top">
          <Brand dark />
          <span className="visual-label">CAREER OS / 01</span>
        </div>
        <div className="visual-copy">
          <p className="eyebrow light">A CALMER WAY TO GET HIRED</p>
          <h1>
            Make your
            <br />
            next <em>move.</em>
          </h1>
          <p className="visual-description">
            One clear space for every application, conversation, and opportunity on your way to work you love.
          </p>
        </div>
        <div className="marquee-strip">
          <div className="marquee-track">
            <span>Track Applications</span>
            <span>Stay Focused</span>
            <span>Land Your Role</span>
            <span>Build Momentum</span>
            <span>Move with Intention</span>
            <span>Track Applications</span>
            <span>Stay Focused</span>
            <span>Land Your Role</span>
            <span>Build Momentum</span>
            <span>Move with Intention</span>
          </div>
        </div>
        <div className="visual-footer">
          <span>© 2024 APPLYFLOW</span>
          <span>BUILT FOR THE AMBITIOUS</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="auth-heading">
            <p className="eyebrow">FASTAPI BACKEND AUTHENTICATION</p>
            <h2>{mode === 'login' ? 'Good to see you again.' : 'Start your next chapter.'}</h2>
            <p>
              {mode === 'login'
                ? 'Sign in with your email and password to access your pipeline.'
                : 'Create your account to track all job applications.'}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setStatus(null);
              }}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => {
                setMode('signup');
                setStatus(null);
              }}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label>
                USERNAME
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alexmorgan"
                  required
                  autoComplete="username"
                />
              </label>
            )}

            <label>
              EMAIL ADDRESS
              <div className="input-wrap">
                <span>@</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              PASSWORD
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? (
                'Please wait…'
              ) : mode === 'login' ? (
                <>Sign in to ApplyFlow <span className="btn-arr">→</span></>
              ) : (
                <>Create Account <span className="btn-arr">→</span></>
              )}
            </button>
          </form>

          {status && (
            <div className={`status ${status.type}`}>
              {status.text}
            </div>
          )}

          <p className="terms">
            Directly authenticated with your local FastAPI backend & PostgreSQL.
          </p>
        </div>
      </section>
    </main>
  );
}
