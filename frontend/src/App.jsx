import React, { useState, useEffect } from 'react';
import InsightAuthModal from './components/InsightAuthModal';
import {
  auth,
  onAuthStateChanged,
  signOut,
  completeEmailLinkSignIn,
} from './services/firebase';

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Monitor Firebase Auth state & handle email link authentication return
  useEffect(() => {
    // Check if user came via email sign-in link
    completeEmailLinkSignIn()
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .catch((err) => console.error('Email link completion error:', err));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOpen(true);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <main className="modal-viewport">
      {isOpen ? (
        <InsightAuthModal
          onClose={() => setIsOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsOpen(false);
          }}
        />
      ) : (
        <div className="reopen-banner">
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Avatar'}
                  style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }}
                />
              )}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>
                Welcome, {currentUser.displayName || currentUser.email || 'Explorer'}
              </h2>
              <p style={{ color: '#888888', fontSize: '14px' }}>{currentUser.email}</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-reopen"
                  onClick={() => setIsOpen(true)}
                >
                  View Sign-in Modal
                </button>
                <button
                  type="button"
                  className="btn-reopen"
                  style={{ backgroundColor: '#222222', color: '#ffffff' }}
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: '#888888', fontSize: '15px' }}>Modal closed.</p>
              <button
                type="button"
                className="btn-reopen"
                onClick={() => setIsOpen(true)}
              >
                Open Sign-up Modal
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
