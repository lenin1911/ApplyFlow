import React, { useState } from 'react';
import { GithubIcon, GoogleIcon, MailIcon } from './Icons';
import {
  signInWithGoogle,
  signInWithGithub,
  sendEmailLink,
} from '../services/firebase';

export default function InsightAuthModal({ onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const isEmailEntered = email.trim().length > 0;

  const handleOAuth = async (providerName, signInFn) => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `Connecting to ${providerName}...` });

    try {
      const user = await signInFn();
      setStatusMessage({
        type: 'success',
        text: `Signed in as ${user.displayName || user.email || 'User'}!`,
      });
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (error) {
      console.error(`${providerName} Sign-In Error:`, error);
      let errorMsg = error.message;

      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign-in window was closed.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMsg = `${providerName} sign-in is not enabled in Firebase Console.`;
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'An account already exists with the same email using another provider.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Please check your connection.';
      }

      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!isEmailEntered || isLoading) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Sending secure sign-in link...' });

    try {
      await sendEmailLink(email.trim());
      setStatusMessage({
        type: 'success',
        text: `Sign-in link sent to ${email.trim()}! Please check your inbox.`,
      });
      setEmail('');
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      let errorMsg = error.message;

      if (error.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMsg = 'Email link sign-in is not enabled in Firebase Console.';
      }

      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-column" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Heading: two lines, bold, centered, ~28-32px */}
      <h1 id="modal-title" className="modal-heading">
        Sign up below to take control<br />of your placement journey.
      </h1>

      {/* Subtext below */}
      <p className="modal-subtext">
        By continuing, you agree to our{' '}
        <a
          href="#privacy"
          className="privacy-link"
          onClick={(e) => {
            e.preventDefault();
            alert('Insight AI Privacy Policy: Your data is secure and never used to train public models without consent.');
          }}
        >
          privacy policy
        </a>
        .
      </p>

      {/* Stacked OAuth Buttons: Continue with GitHub & Continue with Google */}
      <div className="oauth-buttons">
        <button
          type="button"
          className="btn-white"
          onClick={() => handleOAuth('GitHub', signInWithGithub)}
          disabled={isLoading}
          aria-label="Continue with GitHub"
        >
          <span className="btn-icon-slot">
            <GithubIcon size={20} />
          </span>
          <span className="btn-label">Continue with GitHub</span>
        </button>

        <button
          type="button"
          className="btn-white"
          onClick={() => handleOAuth('Google', signInWithGoogle)}
          disabled={isLoading}
          aria-label="Continue with Google"
        >
          <span className="btn-icon-slot">
            <GoogleIcon size={18} />
          </span>
          <span className="btn-label">Continue with Google</span>
        </button>
      </div>

      {/* Thin horizontal divider line */}
      <hr className="modal-divider" />

      {/* Email input & action button */}
      <form className="email-form" onSubmit={handleSubmitEmail}>
        <div className="input-container">
          <span className="input-icon">
            <MailIcon size={18} />
          </span>
          <input
            type="email"
            className="email-input"
            placeholder="enter your mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-label="Email address"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className={`btn-email ${!isEmailEntered || isLoading ? 'disabled' : ''}`}
          disabled={!isEmailEntered || isLoading}
          aria-label="Continue with email"
        >
          {isLoading ? 'Please wait...' : 'Continue with email'}
        </button>
      </form>

      {/* Close text link */}
      <button
        type="button"
        className="modal-close-link"
        onClick={onClose}
        aria-label="Close modal"
      >
        Close
      </button>

      {/* Interactive status / error feedback indicator */}
      {statusMessage.text && (
        <div
          className={`modal-feedback ${statusMessage.type}`}
          role="status"
          aria-live="polite"
        >
          {statusMessage.text}
        </div>
      )}
    </div>
  );
}
