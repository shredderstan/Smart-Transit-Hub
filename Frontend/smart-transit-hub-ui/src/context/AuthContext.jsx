import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeTrip, setActiveTripState] = useState(() => {
    const saved = localStorage.getItem('activeTrip');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse activeTrip from localStorage', e);
      }
    }
    return null;
  });

  const setActiveTrip = (trip) => {
    setActiveTripState(trip);
    if (trip) {
      localStorage.setItem('activeTrip', JSON.stringify(trip));
    } else {
      localStorage.removeItem('activeTrip');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveTrip(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeTrip');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeTrip,
        setActiveTrip,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
