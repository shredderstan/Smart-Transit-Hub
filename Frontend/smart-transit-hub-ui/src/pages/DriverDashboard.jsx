import React, { useState, useEffect } from 'react';
import { Bus, Play, Square, Radio, Zap, AlertTriangle } from 'lucide-react';
import BusMap from '../components/Map/BusMap';
import TripSimulatorControls from '../components/Simulator/TripSimulatorControls';
import { driverAPI, parentAPI, adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';

const DEFAULT_BUS = { busNumber: '—', plateNumber: '—', capacity: '—', routeName: '—' };

export default function DriverDashboard() {
  const { activeTrip, setActiveTrip } = useAuth();
  const [assignedBus, setAssignedBus] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(activeTrip?.tripId || null);
  const [isTripActive, setIsTripActive] = useState(!!currentTripId);
  const [busLocation, setBusLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [busError, setBusError] = useState('');

  // 1. Load Driver's Assigned Bus & Check for Active Trip on Mount
  useEffect(() => {
    (async () => {
      try {
        const bus = await driverAPI.getAssignedBus();
        setAssignedBus(bus);

        // Check if there is an active trip running for this driver
        const active = await driverAPI.getActiveTrip();
        if (active && active.tripId) {
          setCurrentTripId(active.tripId);
          setIsTripActive(true);
          setActiveTrip(active);
        } else if (bus && bus.routeId) {
          // Pre-load route stops so map renders even before initializing trip
          try {
            const stops = await adminAPI.getStops(bus.routeId);
            if (Array.isArray(stops)) setRouteStops(stops);
          } catch (e) {
            console.warn('Could not pre-load route stops', e);
          }
        }
      } catch (err) {
        setBusError('Could not load assigned bus. Make sure you are assigned to a bus by an admin.');
        console.error('Failed to get assigned bus', err);
      }
    })();
  }, []);

  // 2. Load trip stops whenever currentTripId is active
  useEffect(() => {
    if (currentTripId) {
      driverAPI.getTripStops(currentTripId)
        .then((stops) => {
          if (Array.isArray(stops) && stops.length > 0) {
            setRouteStops(stops);
          }
        })
        .catch((err) => console.error('Failed to load trip stops', err));
    }
  }, [currentTripId]);

  // 3. Poll live telemetry for active trip on Driver Dashboard
  useEffect(() => {
    if (isTripActive && currentTripId) {
      const pollTelemetry = async () => {
        try {
          const latest = await parentAPI.getLatestTripData(currentTripId);
          if (latest && latest.latitude !== undefined && latest.longitude !== undefined && latest.latitude !== null && latest.longitude !== null) {
            setBusLocation({
              latitude: latest.latitude,
              longitude: latest.longitude,
              speed: latest.speed,
              nextStopName: latest.nextStopName,
              nextStopId: latest.nextStopId,
              distanceToNextStop: latest.distanceToNextStop,
            });
          }
        } catch (e) {
          console.warn('Driver telemetry poll error', e);
        }
      };

      pollTelemetry();
      const timer = setInterval(pollTelemetry, 2000);
      return () => clearInterval(timer);
    }
  }, [isTripActive, currentTripId]);

  const handleStartTrip = async () => {
    setLoading(true);
    setMsg('');
    try {
      const resp = await driverAPI.initializeTrip();
      setCurrentTripId(resp.tripId);
      setIsTripActive(true);
      setActiveTrip(resp);
      setMsg(resp.message || 'Trip started successfully.');

      // Load trip stops with fallback to assigned bus route stops
      try {
        const stops = await driverAPI.getTripStops(resp.tripId);
        if (Array.isArray(stops) && stops.length > 0) {
          setRouteStops(stops);
        } else if (assignedBus && assignedBus.routeId) {
          const fallbackStops = await adminAPI.getStops(assignedBus.routeId);
          if (Array.isArray(fallbackStops)) setRouteStops(fallbackStops);
        }
      } catch {
        if (assignedBus && assignedBus.routeId) {
          const fallbackStops = await adminAPI.getStops(assignedBus.routeId);
          if (Array.isArray(fallbackStops)) setRouteStops(fallbackStops);
        }
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to initialize trip. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateTrip = async () => {
    if (!currentTripId) return;
    setLoading(true);
    try {
      await driverAPI.terminateTrip(currentTripId);
      setIsTripActive(false);
      setCurrentTripId(null);
      setActiveTrip(null);
      setBusLocation(null);
      setMsg('Trip terminated successfully.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to terminate trip.');
    } finally {
      setLoading(false);
    }
  };

  const bus = assignedBus || DEFAULT_BUS;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-yellow">DRIVER CONSOLE</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>GPS &amp; Telemetry Streamer</span>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            Bus Driver Operational Portal
          </h2>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isTripActive ? (
            <button
              onClick={handleStartTrip}
              className="btn btn-primary btn-lg"
              disabled={loading || !assignedBus}
            >
              <Play size={18} /> {loading ? 'Initializing...' : 'Initialize New Trip'}
            </button>
          ) : (
            <button
              onClick={handleTerminateTrip}
              className="btn btn-danger btn-lg"
              disabled={loading}
            >
              <Square size={18} /> {loading ? 'Terminating...' : 'Terminate Trip'}
            </button>
          )}
        </div>
      </div>

      {busError && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontWeight: 600, marginBottom: '1rem', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {busError}
        </div>
      )}

      {msg && (
        <div style={{
          background: 'var(--yellow-light)',
          color: '#b45309',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          marginBottom: '1.5rem',
          border: '1px solid var(--yellow-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Radio size={16} /> {msg}
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* Left Column: Assigned Bus & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Assigned Bus Card */}
          <div className="card" style={{ borderTop: '4px solid var(--primary-yellow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{
                width: '46px', height: '46px',
                background: 'var(--primary-yellow)', color: '#1e1b4b',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', padding: '12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span>
                <strong style={{ color: 'var(--text-main)' }}>{bus.routeName || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Route Stops:</span>
                <span style={{ fontWeight: 700 }}>{routeStops.length} Stops</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Status:</span>
                <span className={`badge ${isTripActive ? 'badge-green' : 'badge-yellow'}`}>
                  {isTripActive ? 'TRIP IN PROGRESS' : 'IDLE / READY'}
                </span>
              </div>
            </div>
          </div>

          {/* Trip Simulator Controls */}
          {isTripActive && routeStops.length > 0 ? (
            <TripSimulatorControls
              routeStops={routeStops}
              busNumber={bus.busNumber}
              tripId={currentTripId}
              onLocationUpdate={(locData) => setBusLocation(locData)}
            />
          ) : isTripActive && routeStops.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Radio size={28} style={{ color: 'var(--primary-yellow)', margin: '0 auto 8px auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Trip Active — Loading Route Stops...
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Waiting for route stop data from server.
              </p>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Zap size={32} style={{ color: 'var(--primary-yellow)', margin: '0 auto 8px auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Initialize Trip to Start Telemetry
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 0 auto' }}>
                Click "Initialize New Trip" above to start sending GPS coordinates to the backend.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Driver Map View */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            activeBusNumber={bus.busNumber}
            height="480px"
          />
        </div>
      </div>

      {/* Floating AI Chatbot Assistant for Driver */}
      <Chatbot 
        role="driver" 
        dashboardContext={{
          assignedBus: bus,
          tripActive: isTripActive,
          currentTripId: currentTripId,
          busLocation: busLocation ? { 
            latitude: busLocation.latitude, 
            longitude: busLocation.longitude, 
            speed: `${busLocation.speed || 0} km/h`,
            eta: busLocation.eta
          } : null,
          stops: routeStops.map(s => ({ name: s.stopName || s.name, eta: s.eta, status: s.status }))
        }} 
      />
    </div>
  );
}
