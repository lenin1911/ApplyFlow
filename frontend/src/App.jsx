import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ApplyFlowDashboard from './components/dashboard/ApplyFlowDashboard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--af-bg-base, #0F1117)',
          gap: 16,
        }}
      >
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#FB923C" fillOpacity="0.15" />
            <path d="M10 22L16 10L22 22" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 18H19.5" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
            ApplyFlow
          </span>
        </div>
        {/* Spinner */}
        <div
          style={{
            width: 22,
            height: 22,
            border: '2.5px solid rgba(251,146,60,0.2)',
            borderTop: '2.5px solid #FB923C',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? <ApplyFlowDashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
