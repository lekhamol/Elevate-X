import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('elevator_user');
    return saved ? JSON.parse(saved) : { name: 'Safety Admin', role: 'ENGINEER', email: 'admin@safetytwin.io' };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('elevator_auth') === 'true';
  });

  const login = (email, password, role = 'ENGINEER') => {
    const userData = {
      name: role === 'ADMIN' ? 'System Administrator' : (role === 'ENGINEER' ? 'Lead Safety Engineer' : 'Building Operator'),
      email,
      role,
      loginTime: new Date().toISOString()
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('elevator_user', JSON.stringify(userData));
    localStorage.setItem('elevator_auth', 'true');
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('elevator_user');
    localStorage.removeItem('elevator_auth');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
