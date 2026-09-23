import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('elevator_user');
    return saved ? JSON.parse(saved) : { name: 'Lead Safety Engineer', role: 'ENGINEER', email: 'engineer@safetytwin.io' };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('elevator_auth') === 'true';
  });

  const login = (email, password, role = 'ENGINEER') => {
    const formattedRole = role.toUpperCase();
    let name = 'Lead Safety Engineer';
    if (formattedRole === 'ADMIN') name = 'System Administrator';
    if (formattedRole === 'OPERATOR') name = 'Building Operator';

    const userData = {
      name,
      email,
      role: formattedRole,
      loginTime: new Date().toISOString()
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('elevator_user', JSON.stringify(userData));
    localStorage.setItem('elevator_auth', 'true');
    return formattedRole;
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
