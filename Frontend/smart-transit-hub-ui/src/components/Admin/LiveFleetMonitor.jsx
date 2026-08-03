import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { adminAPI } from '../../api/client';
import BusMap from '../Map/BusMap';

export default function LiveFleetMonitor() {
  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedAdminTrip, setSelectedAdminTrip] = useState(null);
  const [adminBusLocation, setAdminBusLocation] = useState(null);
  const [adminRouteStops, setAdminRouteStops] = useState([]);

  // 1. Poll active trips every 3 seconds
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const trips = await adminAPI.getActiveTrips();
        setActiveTrips(trips || []);
        if (trips && trips.length > 0) {
          setSelectedAdminTrip((prev) => {
            if (!prev) return trips[0];
            const match = trips.find((t) => t.tripId === prev.tripId);
            return match || trips[0];
          });
        } else {
          setSelectedAdminTrip(null);
          setAdminBusLocation(null);
        }
      } catch (e) {
        console.warn('Active trips poll error', e);
      }
    };

    fetchActive();
    const timer = setInterval(fetchActive, 3000);
    return () => clearInterval(timer);
  }, []);

  // 2. Load route stops when selected trip's routeId changes
  useEffect(() => {
    if (selectedAdminTrip?.routeId) {
      adminAPI.getStops(selectedAdminTrip.routeId)
        .then((stops) => setAdminRouteStops(stops || []))
        .catch((e) => console.warn('Could not load admin route stops', e));
    } else {
      setAdminRouteStops([]);
    }
  }, [selectedAdminTrip?.routeId]);

  // 3. Poll live coordinates every 2 seconds for the selected admin trip
  useEffect(() => {
    if (selectedAdminTrip?.tripId) {
      const fetchLive = async () => {
        try {
          const latest = await adminAPI.getLatestTripData(selectedAdminTrip.tripId);
          if (latest && latest.latitude !== undefined && latest.longitude !== undefined && latest.latitude !== null && latest.longitude !== null) {
            setAdminBusLocation({
              latitude: latest.latitude,
              longitude: latest.longitude,
              speed: latest.speed,
              nextStopName: latest.nextStopName,
              nextStopId: latest.nextStopId,
              distanceToNextStop: latest.distanceToNextStop,
            });
          }
        } catch (e) {
          console.warn('Admin trip telemetry error', e);
        }
      };

      fetchLive();
      const timer = setInterval(fetchLive, 2000);
      return () => clearInterval(timer);
    } else {
      setAdminBusLocation(null);
    }
  }, [selectedAdminTrip?.tripId]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h3 className="section-title">Live Fleet Tracking Map</h3>
          <p className="section-subtitle">Real-time OpenStreetMap tracking for all active system trips</p>
        </div>
        {activeTrips.length > 0 && (
          <span className="badge badge-green">
            <Radio size={12} className="animate-pulse" /> {activeTrips.length} ACTIVE {activeTrips.length === 1 ? 'BUS' : 'BUSES'} STREAMING
          </span>
        )}
      </div>

      {activeTrips.length === 0 ? (
        <div className="tracking-empty-state">
          <Radio size={32} style={{ color: 'var(--primary-yellow)', margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>No Active Bus Trips</h4>
          <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>When a driver initializes a trip, live tracking will automatically connect to OpenStreetMap here.</p>
        </div>
      ) : (
        <div className="tracking-grid">
          {/* Active Bus Selector */}
          <div className="tracking-selectors">
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Active Vehicle:</label>
            {activeTrips.map((t) => {
              const isSelected = selectedAdminTrip?.tripId === t.tripId;
              return (
                <div
                  key={t.tripId}
                  onClick={() => setSelectedAdminTrip(t)}
                  className={`tracking-bus-card ${isSelected ? 'tracking-bus-selected' : 'tracking-bus-default'}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>{t.busNumber}</span>
                    <span className="badge badge-yellow">Trip #{t.tripId}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Route: <strong>{t.routeName}</strong> &bull; Driver: {t.driverName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* OpenStreetMap Vehicle Tracker */}
          <div className="map-card-wrapper">
            {selectedAdminTrip && (
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Live Location: {selectedAdminTrip.busNumber} ({selectedAdminTrip.routeName})
                </h4>
                {adminBusLocation && (
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--yellow-hover)' }}>
                    Speed: {Math.round(adminBusLocation.speed || 0)} km/h &bull; Next: {adminBusLocation.nextStopName || 'En Route'}
                  </div>
                )}
              </div>
            )}
            <BusMap
              busLocation={adminBusLocation}
              routeStops={adminRouteStops}
              activeBusNumber={selectedAdminTrip?.busNumber || 'BUS'}
              height="460px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
