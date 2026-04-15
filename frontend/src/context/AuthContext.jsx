import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('petconnect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // MongoDB Silent Auto-Sync on Boot (Fallback with LocalStorage)
  useEffect(() => {

    const syncWithMongo = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/user/me`, {
           credentials: 'include'
        });
        
        if (res.ok) {
           const mongoData = await res.json();
           if (!mongoData.offlineFallback && mongoData.authenticated !== false) {
              setUser(mongoData);
              localStorage.setItem('petconnect_user', JSON.stringify(mongoData));
           } else {
              setUser(null);
              localStorage.removeItem('petconnect_user');
           }
        } else {
           setUser(null);
           localStorage.removeItem('petconnect_user');
        }
      } catch (err) {
        console.log("Could not hit backend for secure sync.", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    syncWithMongo();
  }, []);

  const login = async () => {
    // Under Cookie architecture, Google Auth response just sets the cookie.
    // We fetch /api/user/me to establish state securely!
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/user/me`, {
         credentials: 'include'
      });
      if (res.ok) {
         const mongoData = await res.json();
         if (!mongoData.offlineFallback && mongoData.authenticated !== false) {
            setUser(mongoData);
            localStorage.setItem('petconnect_user', JSON.stringify(mongoData));
            return mongoData;
         }
      }
    } catch(err) { console.error("Login verification failed", err); }
    return null;
  };

  const updateUser = (updates) => {
    setUser(prev => {
      if (prev) {
        const updated = { ...prev, ...updates };
        localStorage.setItem('petconnect_user', JSON.stringify(updated));
        return updated;
      }
      return null;
    });
  };

  const logout = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      localStorage.clear(); // Total eradication of any lingering legacy bits
      window.location.href = '/';
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
