import React from 'react';
import { Bus } from 'lucide-react';

export default function DriverBusCard({ bus, routeStopsLength, isTripActive }) {
  return (
    <div className="card" style={{ borderTop: '4px solid var(--primary-yellow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <div className="bus-card-icon-wrapper">
          <Bus size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {bus.busNumber}
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Plate: {bus.plateNumber} &bull; Capacity: {bus.capacity}
          </span>
        </div>
      </div>

      <div className="bus-details-table">
        <div className="bus-details-row">
          <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span>
          <strong style={{ color: 'var(--text-main)' }}>{bus.routeName || '—'}</strong>
        </div>
        <div className="bus-details-row">
          <span style={{ color: 'var(--text-muted)' }}>Total Route Stops:</span>
          <span style={{ fontWeight: 700 }}>{routeStopsLength} Stops</span>
        </div>
        <div className="bus-details-row">
          <span style={{ color: 'var(--text-muted)' }}>Active Status:</span>
          <span className={`badge ${isTripActive ? 'badge-green' : 'badge-yellow'}`}>
            {isTripActive ? 'TRIP IN PROGRESS' : 'IDLE / READY'}
          </span>
        </div>
      </div>
    </div>
  );
}
