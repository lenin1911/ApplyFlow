import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const profile = await authApi.getMe();
      setUser(profile);
      return profile;
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      removeToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [fetchProfile]);

  const login = async (email, password) => {
    setError(null);
    const result = await authApi.login({ email, password });
    if (result && result.access_token) {
      setToken(result.access_token);
      const profile = await authApi.getMe();
      setUser(profile);
      return profile;
    }
    throw new Error('No access token returned');
  };

  const register = async (username, email, password) => {
    setError(null);
    await authApi.register({ username, email, password });
    // Automatically log in after registration
    return await login(email, password);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    user,
    token: getToken(),
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
