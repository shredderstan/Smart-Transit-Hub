import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestFcmToken } from '../firebase';
import { driverAPI, parentAPI } from '../api/client';
import { removeNotificationToken } from '../services/notificationServices';

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

  // Auto-register FCM token when user and token are loaded (both login and page refresh)
  useEffect(() => {
    if (user && token && (user.role === 'ROLE_DRIVER' || user.role === 'ROLE_PARENT')) {
      const registerFcm = async () => {
        try {
          const fcmToken = await requestFcmToken();
          if (fcmToken) {
            localStorage.setItem('fcmToken', fcmToken);
            const dto = { fcmToken, platform: 'WEB' };
            if (user.role === 'ROLE_DRIVER') {
              await driverAPI.registerNotificationToken(dto);
            } else {
              await parentAPI.registerNotificationToken(dto);
            }
            console.log('FCM Token auto-registered successfully.');
          }
        } catch (e) {
          console.warn('FCM token auto-registration failed:', e);
        }
      };
      registerFcm();
    }
  }, [user, token]);

  const login = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);

    // Promptly register token during login
    if (userData.role === 'ROLE_DRIVER' || userData.role === 'ROLE_PARENT') {
      try {
        const fcmToken = await requestFcmToken();
        if (fcmToken) {
          localStorage.setItem('fcmToken', fcmToken);
          const dto = { fcmToken, platform: 'WEB' };
          if (userData.role === 'ROLE_DRIVER') {
            await driverAPI.registerNotificationToken(dto);
          } else {
            await parentAPI.registerNotificationToken(dto);
          }
        }
      } catch (e) {
        console.warn('FCM token registration on login failed:', e);
      }
    }
  };

  const logout = async () => {
    const cachedToken = localStorage.getItem('fcmToken');
    if (cachedToken && user && token) {
      try {
        const dto = { fcmToken: cachedToken, platform: 'WEB' };
        if (user.role === 'ROLE_DRIVER') {
          await driverAPI.removeNotificationToken(dto);
        } else if (user.role === 'ROLE_PARENT') {
          await parentAPI.removeNotificationToken(dto);
        }
      } catch (e) {
        console.warn('FCM token removal on logout failed:', e);
      }
    }

    setUser(null);

    setToken(null);

    setActiveTrip(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeTrip');
    localStorage.removeItem('fcmToken');
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
