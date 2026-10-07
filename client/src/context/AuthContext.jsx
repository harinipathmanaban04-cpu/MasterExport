import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'master_export_auth_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Authenticate credentials
  const login = async (identifier, password) => {
    setLoading(true);

    // Simulate realistic executive auth handshake
    await new Promise((res) => setTimeout(res, 400));

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Accepted credentials:
    // Email / ID: admin or admin@masterexport.com
    // Password: admin123
    const isValidId = cleanId === 'admin' || cleanId === 'admin@masterexport.com';
    const isValidPass = cleanPass === 'admin123';

    if (isValidId && isValidPass) {
      const userData = {
        id: 'admin',
        username: 'admin',
        name: 'Master Administrator',
        email: 'admin@masterexport.com',
        role: 'Super Administrator',
        avatar: 'A',
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }

      setLoading(false);
      return { success: true, user: userData };
    }

    setLoading(false);
    return {
      success: false,
      error: 'Invalid login ID or password. Use mail: admin & pass: admin123.'
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('LocalStorage clear failed:', err);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
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
