import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin' or 'doctor'
  const [loading, setLoading] = useState(true);
  // const API_BASE_URL = 'http://localhost:5000';
  const API_BASE_URL = 'https://doctors-backend-plum.vercel.app';


  useEffect(() => {
    // Check for existing user data on app load
    const adminData = localStorage.getItem('admin');
    const doctorData = localStorage.getItem('doctor');

    if (adminData) {
      setUser(JSON.parse(adminData));
      setUserType('admin');
    } else if (doctorData) {
      setUser(JSON.parse(doctorData));
      setUserType('doctor');
    }

    setLoading(false);
  }, []);

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem(type, JSON.stringify(userData));
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('doctor');
    window.dispatchEvent(new Event('storage'));
  };

  const value = {
    API_BASE_URL,
    user,
    userType,
    loading,
    login,
    logout,
    setUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 