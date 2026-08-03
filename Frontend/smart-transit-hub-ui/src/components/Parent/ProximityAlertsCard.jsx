import React from 'react';
import { Bell } from 'lucide-react';

export default function ProximityAlertsCard({ alerts }) {
  if (alerts.length === 0) return null;

  return (
    <div className="card">
      <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={16} style={{ color: 'var(--primary-yellow)' }} /> Proximity Alerts
      </h4>
      <div className="alerts-feed-list">
        {alerts.map((a, idx) => (
          <div
            key={idx}
            className="alert-feed-item"
            style={{
              background: a.type === 'arrival' ? 'var(--success-light)' : 'var(--yellow-light)',
              borderColor: a.type === 'arrival' ? '#a7f3d0' : 'var(--yellow-border)',
              color: a.type === 'arrival' ? '#065f46' : '#92400e',
            }}
          >
            <span>{a.message}</span>
            <span className="alert-item-time">{a.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
