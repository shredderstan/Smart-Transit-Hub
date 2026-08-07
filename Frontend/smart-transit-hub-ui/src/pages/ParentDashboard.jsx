import React, { useState, useEffect } from 'react';
import { User, Bus, MapPin, Bell, Radio, AlertTriangle } from 'lucide-react';
import BusMap from '../components/Map/BusMap';
import { parentAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';

export default function ParentDashboard() {
  const { activeTrip: contextActiveTrip, setActiveTrip } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(contextActiveTrip || null);
  const [routeStops, setRouteStops] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch parent's registered student profiles on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await parentAPI.getStudents();
        const studentList = Array.isArray(data) ? data : [];
        setStudents(studentList);
        if (studentList.length > 0) {
          setSelectedStudent(studentList[0]);
        }
      } catch (err) {
        setError('Could not load student profiles. Please check your account setup.');
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Poll for active trip for this parent every 3 seconds
  useEffect(() => {
    const checkActiveTrip = async () => {
      try {
        const active = await parentAPI.getActiveTrip();
        if (active && active.tripId) {
          setCurrentTrip((prev) => (prev?.tripId === active.tripId ? prev : active));
          setActiveTrip(active);
        }
      } catch (err) {
        console.warn('Active trip check error for parent', err);
      }
    };

    checkActiveTrip();
    const timer = setInterval(checkActiveTrip, 3000);
    return () => clearInterval(timer);
  }, [setActiveTrip]);

  // 3. Load route stops (Priority: Active Trip Stops -> Student Route Stops)
  useEffect(() => {
    let isSubscribed = true;

    const loadStops = async () => {
      const activeTripId = currentTrip?.tripId || contextActiveTrip?.tripId;

      if (activeTripId) {
        // Option A: Active trip is running — fetch stops for this trip
        try {
          const stops = await parentAPI.getTripStops(activeTripId);
          if (isSubscribed && Array.isArray(stops) && stops.length > 0) {
            setRouteStops(stops);
            return;
          }
        } catch (e) {
          console.warn('Could not load active trip stops', e);
        }
      }

      // Option B: Idle state — preview route stops for selected student's assigned route
      const routeId = selectedStudent?.routeId || currentTrip?.routeId;
      if (routeId) {
        try {
          const stops = await parentAPI.getRouteStops(routeId);
          if (isSubscribed && Array.isArray(stops)) {
            setRouteStops(stops);
            return;
          }
        } catch (e) {
          console.warn('Could not load student route stops', e);
        }
      }

      if (isSubscribed) setRouteStops([]);
    };

    loadStops();
    return () => { isSubscribed = false; };
  }, [currentTrip?.tripId, currentTrip?.routeId, contextActiveTrip?.tripId, selectedStudent?.routeId]);

  const currentTripRef = React.useRef(currentTrip);
  const contextActiveTripRef = React.useRef(contextActiveTrip);
  const selectedStudentRef = React.useRef(selectedStudent);

  useEffect(() => { currentTripRef.current = currentTrip; }, [currentTrip]);
  useEffect(() => { contextActiveTripRef.current = contextActiveTrip; }, [contextActiveTrip]);
  useEffect(() => { selectedStudentRef.current = selectedStudent; }, [selectedStudent]);

  // 4. Poll live vehicle telemetry continuously
  useEffect(() => {
    const pollTelemetry = async () => {
      const activeTripId = currentTripRef.current?.tripId || contextActiveTripRef.current?.tripId || 1;
      try {
        const latest = await parentAPI.getLatestTripData(activeTripId);
        if (
          latest &&
          latest.latitude !== undefined && latest.latitude !== null &&
          latest.longitude !== undefined && latest.longitude !== null
        ) {
          const locData = {
            latitude: Number(latest.latitude),
            longitude: Number(latest.longitude),
            speed: latest.speed || 0,
            nextStopName: latest.nextStopName,
            nextStopId: latest.nextStopId,
            distanceToNextStop: latest.distanceToNextStop,
          };
          console.log("Latest telemetry", latest);
          setBusLocation(locData);

          // Proximity notification check for selected child's stop
          const currentStudent = selectedStudentRef.current;
          if (currentStudent?.stopName && locData.nextStopName) {
            const childStopLower = currentStudent.stopName.toLowerCase();
            const nextStopLower = locData.nextStopName.toLowerCase();
            if (nextStopLower.includes(childStopLower)) {
              setAlerts((prev) => {
                const exists = prev.some((a) => a.stopName === currentStudent.stopName);
                if (exists) return prev;
                return [
                  {
                    id: Date.now(),
                    stopName: currentStudent.stopName,
                    text: `🎯 School bus is arriving at ${currentStudent.stopName}!`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'success',
                  },
                  ...prev,
                ];
              });
            }
          }
        }
      } catch (err) {
        console.warn('Parent telemetry stream error', err);
      }
    };

    pollTelemetry();
    const timer = setInterval(pollTelemetry, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTripObj = currentTrip || contextActiveTrip;

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
            <span className="badge badge-yellow">PARENT PORTAL</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Real-Time OpenStreetMap Tracking</span>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            Student Bus Tracking Dashboard
          </h2>
        </div>

        {/* Student Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {students.map((stu) => {
            const isSelected = selectedStudent?.id === stu.id;
            return (
              <button
                key={stu.id}
                onClick={() => setSelectedStudent(stu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary-yellow)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--yellow-light)' : '#ffffff',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <User size={16} style={{ color: isSelected ? 'var(--yellow-hover)' : 'var(--text-muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {stu.firstName} {stu.lastName}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {stu.rollNumber} &bull; {stu.stopName || 'No Stop'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600, border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading student profiles...
        </div>
      )}

      {!loading && students.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No students found for your account. Please contact your administrator to assign a student record.
        </div>
      )}

      {!loading && students.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

          {/* Left Column: Live School Bus Map */}
          <div style={{ gridColumn: 'span 2 / span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

              {/* OpenStreetMap Component */}
              <BusMap
                busLocation={busLocation}
                routeStops={routeStops}
                activeBusNumber={activeTripObj?.busNumber || 'BUS'}
                height="480px"
              />
            </div>
          </div>

          {/* Right Column: Status & Alerts Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Student Info Card */}
            {selectedStudent && (
              <div className="card" style={{ borderLeft: '4px solid var(--primary-yellow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--yellow-light)', color: 'var(--yellow-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h4>
                    <span className="badge badge-yellow" style={{ fontSize: '0.6875rem' }}>
                      Roll: {selectedStudent.rollNumber}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Stop:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedStudent.stopName || 'Unassigned'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedStudent.routeName || 'System Route'}</strong>
                  </div>
                  {busLocation && busLocation.nextStopName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Next Bus Stop:</span>
                      <span style={{ fontWeight: 700, color: 'var(--yellow-hover)' }}>{busLocation.nextStopName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Tracking Telemetry Card */}
            <div className="card">
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--primary-yellow)' }} /> Live Telemetry Monitor
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span className={`badge ${activeTripObj ? 'badge-green' : 'badge-yellow'}`}>
                    {activeTripObj ? `TRIP #${activeTripObj.tripId} ACTIVE` : 'BUS IDLE'}
                  </span>
                </div>
                {busLocation ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Live Speed:</span>
                      <span style={{ fontWeight: 700 }}>{Math.round(busLocation.speed || 0)} km/h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Approaching Stop:</span>
                      <span style={{ fontWeight: 700 }}>{busLocation.nextStopName || 'En Route'}</span>
                    </div>
                    {busLocation.distanceToNextStop !== undefined && busLocation.distanceToNextStop !== null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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

            {/* Proximity Alerts Feed */}
            {alerts.length > 0 && (
              <div className="card">
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} style={{ color: 'var(--primary-yellow)' }} /> Proximity Alerts
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts.slice(0, 5).map((al) => (
                    <div
                      key={al.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--success-light)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78125rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{al.text}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>{al.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Chatbot Assistant */}
      <Chatbot 
        role="parent" 
        dashboardContext={{
          student: selectedStudent ? { name: selectedStudent.name || selectedStudent.studentName, stop: selectedStudent.stopName } : null,
          trip: currentTrip || contextActiveTrip,
          busLocation: busLocation ? { 
            latitude: busLocation.latitude, 
            longitude: busLocation.longitude, 
            speed: `${busLocation.speed || 0} km/h`, 
            eta: busLocation.eta, 
            distanceToNextStop: busLocation.distanceToNextStop 
          } : null,
          stops: routeStops.map(s => ({ name: s.stopName || s.name, eta: s.eta, status: s.status })),
          alerts: alerts.slice(0, 3)
        }} 
      />
    </div>
  );
}
