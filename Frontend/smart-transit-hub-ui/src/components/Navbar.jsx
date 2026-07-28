import React from 'react';
import { Bus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  ROLE_ADMIN: { bg: '#fef3c7', color: '#92400e', label: 'ADMIN' },
  ROLE_DRIVER: { bg: '#dbeafe', color: '#1e40af', label: 'DRIVER' },
  ROLE_PARENT: { bg: '#d1fae5', color: '#065f46', label: 'PARENT' },
};

export default function Navbar() {
  const { user, logout } = useAuth();

  const roleInfo = user ? (roleColors[user.role] || { bg: '#f3f4f6', color: '#374151', label: user.role }) : null;

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 2000,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary-yellow)',
            color: '#1e1b4b',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-yellow)'
          }}>
            <Bus size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              SmartTransit<span style={{ color: 'var(--primary-yellow)' }}>Hub</span>
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              School Bus Tracking &amp; Telemetry System
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user.fullName || user.username}
              </div>
              {roleInfo && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '999px',
                  background: roleInfo.bg,
                  color: roleInfo.color,
                  letterSpacing: '0.05em'
                }}>
                  {roleInfo.label}
                </span>
              )}
            </div>

            <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
              <LogOut size={15} /> Exit
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Professional Bus Tracking
          </div>
        )}
      </div>
    </header>
  );
}
