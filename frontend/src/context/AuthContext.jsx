import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('petconnect_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (!parsed.tags) parsed.tags = [];
      if (parsed.email === 'mitalipaullol268@gmail.com' && !parsed.tags.includes('Admin')) parsed.tags.push('Admin');
      return parsed;
    }
    return null;
  });
  // Inside AuthProvider immediately after state initialization:
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === null || e.key === 'petconnect_user') {
        const stored = localStorage.getItem('petconnect_user');
        if (!stored) {
          setUser(null);
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        } else {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
          } catch (err) {
            console.error('Failed to sync auth state', err);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const login = (userData) => {
    // Simulated Google Login Auth
    setUser(userData);
    localStorage.setItem('petconnect_user', JSON.stringify(userData));
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('petconnect_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
