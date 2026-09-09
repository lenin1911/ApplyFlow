import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCkgmGa8VgWFtCrVoI400KQe28_dOMYg2o",
  authDomain: "applyflow-858e0.firebaseapp.com",
  projectId: "applyflow-858e0",
  storageBucket: "applyflow-858e0.firebasestorage.app",
  messagingSenderId: "657194866350",
  appId: "1:657194866350:web:ea7d26feccb03ac51c7f3f",
  measurementId: "G-VFHRQ8ZEPR"
};

// Initialize or get existing Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// GitHub scopes (read:user, user:email)
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with GitHub Popup
 */
export async function signInWithGithub() {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
}

/**
 * Send passwordless sign-in link to user email
 */
export async function sendEmailLink(email) {
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
}

/**
 * Check and complete email link sign-in if returning from email
 */
export async function completeEmailLinkSignIn() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return result.user;
    }
  }
  return null;
}

export { signOut, onAuthStateChanged };
