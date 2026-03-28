import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // According to security requirements, unauthenticated users only have access to landing, about, and login
    // So we bounce any unauthenticated deep links directly to the root generic view
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
