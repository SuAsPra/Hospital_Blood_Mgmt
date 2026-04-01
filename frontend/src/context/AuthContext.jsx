import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isExpired = (payload) => {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [payload, setPayload] = useState(() => (token ? decodeToken(token) : null));

  const login = (newToken) => {
    const decoded = decodeToken(newToken);
    if (isExpired(decoded)) {
      localStorage.removeItem('token');
      setToken(null);
      setPayload(null);
      return;
    }
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setPayload(decoded);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setPayload(null);
  };

  if (token && isExpired(payload)) {
    localStorage.removeItem('token');
  }

  const value = useMemo(
    () => ({
      token,
      user: payload ? { id: payload.id, role: payload.role } : null,
      login,
      logout,
    }),
    [token, payload]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
