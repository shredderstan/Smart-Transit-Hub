import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
        <Navbar />
        <Login />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />
      <main>
        {user.role === 'ROLE_PARENT' && <ParentDashboard />}
        {user.role === 'ROLE_DRIVER' && <DriverDashboard />}
        {user.role === 'ROLE_ADMIN' && <AdminDashboard />}
        {!['ROLE_PARENT', 'ROLE_DRIVER', 'ROLE_ADMIN'].includes(user.role) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Unknown role: <strong>{user.role}</strong>. Please contact your administrator.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
