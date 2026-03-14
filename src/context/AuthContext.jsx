import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking local storage for mocked session
    const storedUser = localStorage.getItem('resumeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login implementation
    // In a real app we'd verify with a backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const userData = { id: 1, email, name: email.split('@')[0] };
          localStorage.setItem('resumeUser', JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  };

  const register = (email, password) => {
    // Mock registration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const userData = { id: Date.now(), email, name: email.split('@')[0] };
          localStorage.setItem('resumeUser', JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error("Registration failed"));
        }
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem('resumeUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
