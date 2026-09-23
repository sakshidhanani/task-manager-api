import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => api.getToken());
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionMessage, setSessionMessage] = useState(null); // e.g. "Session expired, please log in again"

  const logout = useCallback((message) => {
    api.clearToken();
    setTokenState(null);
    setUser(null);
    if (message) setSessionMessage(message);
  }, []);

  // Whenever ANY api.js call gets a 401 (missing/expired/invalid token),
  // log the user out and show them why - this is the frontend's "redirect
  // to login on 401" handling from the Practical 7 supplementary problems.
  useEffect(() => {
    api.onUnauthorized((errorMessage) => {
      logout(errorMessage || 'Your session has expired. Please log in again.');
    });
  }, [logout]);

  // On first load, if a token is already stored, verify it's still valid
  // by calling GET /auth/me instead of trusting it blindly.
  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }
    api
      .getMe()
      .then((data) => setUser(data))
      .catch(() => {
        /* onUnauthorized already handles clearing an invalid/expired token */
      })
      .finally(() => setCheckingSession(false));
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setSessionMessage(null);
    return data;
  };

  const register = async (email, password) => {
    return api.register(email, password);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    checkingSession,
    sessionMessage,
    clearSessionMessage: () => setSessionMessage(null),
    login,
    register,
    logout: () => logout(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
