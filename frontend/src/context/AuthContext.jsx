import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('petconnect_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Check token on mount in a real app
  useEffect(() => {
  }, []);

  const login = (userData) => {
    // Simulated Google Login Auth
    setUser(userData);
    localStorage.setItem('petconnect_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('petconnect_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
