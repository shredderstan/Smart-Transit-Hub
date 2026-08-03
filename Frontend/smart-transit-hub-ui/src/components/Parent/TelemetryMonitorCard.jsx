import React from 'react';
import { MapPin } from 'lucide-react';

export default function TelemetryMonitorCard({ activeTripObj, busLocation }) {
  return (
    <div className="card">
      <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin size={16} style={{ color: 'var(--primary-yellow)' }} /> Live Telemetry Monitor
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="telemetry-row">
          <span style={{ color: 'var(--text-muted)' }}>Status:</span>
          <span className={`badge ${activeTripObj ? 'badge-green' : 'badge-yellow'}`}>
            {activeTripObj ? `TRIP #${activeTripObj.tripId} ACTIVE` : 'BUS IDLE'}
          </span>
        </div>
        {busLocation ? (
          <>
            <div className="telemetry-row">
              <span style={{ color: 'var(--text-muted)' }}>Live Speed:</span>
              <span style={{ fontWeight: 700 }}>{Math.round(busLocation.speed || 0)} km/h</span>
            </div>
            <div className="telemetry-row">
              <span style={{ color: 'var(--text-muted)' }}>Approaching Stop:</span>
              <span style={{ fontWeight: 700 }}>{busLocation.nextStopName || 'En Route'}</span>
            </div>
            {busLocation.distanceToNextStop !== undefined && busLocation.distanceToNextStop !== null && (
              <div className="telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>Distance to Stop:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-yellow)' }}>
                  {Math.round(busLocation.distanceToNextStop)} meters
                </span>
              </div>
            )}
          </>
        ) : activeTripObj ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Connecting to Redis telemetry stream...</div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Waiting for trip initialization...</div>
        )}
      </div>
    </div>
  );
}
