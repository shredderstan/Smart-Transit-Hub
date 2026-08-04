import React from 'react';
import { Radio } from 'lucide-react';
import BusMap from '../Map/BusMap';

export default function DriverMapCard({ busLocation, routeStops, busNumber, isTripActive }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="driver-map-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Driver Live Route Map
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Real-time bus location, route polyline, and stop markers
          </p>
        </div>
        {isTripActive && (
          <span className="badge badge-green">
            <Radio size={12} /> STREAMING GPS
          </span>
        )}
      </div>

      <BusMap
        busLocation={busLocation}
        routeStops={routeStops}
        activeBusNumber={busNumber}
        height="480px"
      />
    </div>
  );
}
