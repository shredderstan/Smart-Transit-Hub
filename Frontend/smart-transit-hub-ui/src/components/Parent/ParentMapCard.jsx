import React from 'react';
import { Radio } from 'lucide-react';
import BusMap from '../Map/BusMap';

export default function ParentMapCard({ activeTripObj, busLocation, routeStops }) {
  return (
    <div className="card" style={{ padding: '1.25rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Live OpenStreetMap GPS Tracking
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {activeTripObj
              ? `Trip #${activeTripObj.tripId} active • Bus: ${activeTripObj.busNumber || 'BUS'} • Telemetry stream active (2s)`
              : 'Bus is currently idle. Showing student route preview & stops map.'}
          </p>
        </div>

        {busLocation && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-yellow)' }}>
                {Math.round(busLocation.speed || 0)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>km/h</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>LIVE SPEED</div>
            </div>
          </div>
        )}
      </div>

      {!activeTripObj && (
        <div style={{ background: 'var(--yellow-light)', color: '#b45309', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid var(--yellow-border)' }}>
          <Radio size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Bus is currently ready/idle. When driver starts the trip, live GPS vehicle tracking will display on this map automatically.
        </div>
      )}

      <BusMap
        busLocation={busLocation}
        routeStops={routeStops}
        activeBusNumber={activeTripObj?.busNumber || 'BUS'}
        height="480px"
      />
    </div>
  );
}
