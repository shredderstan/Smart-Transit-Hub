import React, { useState, useEffect } from 'react';
import { User, Bus, MapPin, Bell, Radio, AlertTriangle } from 'lucide-react';
import BusMap from '../components/Map/BusMap';
import { parentAPI, driverAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ParentDashboard() {
  const { activeTrip } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load parent's students on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await parentAPI.getStudents();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        setError('Could not load student profiles. Please check your account setup.');
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch route stops when a trip is active
  useEffect(() => {
    const tripId = activeTrip?.tripId;
    if (tripId) {
      driverAPI.getTripStops(tripId)
        .then((stops) => {
          if (Array.isArray(stops)) setRouteStops(stops);
        })
        .catch((err) => console.warn('Could not load trip stops for parent map', err));
    }
  }, [activeTrip]);

  // Polling for live trip data
  useEffect(() => {
    const tripId = activeTrip?.tripId;
    if (!tripId) return;

    // Immediately fetch once, then interval
    const fetchLatest = async () => {
      try {
        const latest = await parentAPI.getLatestTripData(tripId);
        if (latest) {
          const locData = {
            latitude: latest.latitude,
            longitude: latest.longitude,
            speed: latest.speed,
            nextStopName: latest.nextStopName,
            nextStopId: latest.nextStopId,
            distanceToNextStop: latest.distanceToNextStop,
          };
          setBusLocation(locData);

          // Generate proximity alert if bus is approaching student's stop
          if (selectedStudent && locData.nextStopName) {
            const isApproachingStudentStop =
              selectedStudent.stopName &&
              locData.nextStopName.toLowerCase().includes(selectedStudent.stopName.toLowerCase());
            if (isApproachingStudentStop) {
              setAlerts((prev) => {
                const alreadyExists = prev.some((a) => a.text.includes(selectedStudent.stopName));
                if (alreadyExists) return prev;
                return [
                  {
                    id: Date.now(),
                    text: `🎯 Bus is approaching your child's stop: ${selectedStudent.stopName}`,
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
        console.warn('Trip data poll error', err);
      }
    };

    fetchLatest();
    const timer = setInterval(fetchLatest, 3000);

    return () => clearInterval(timer);
  }, [activeTrip, selectedStudent]);

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
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Real-Time Live Tracking</span>
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
                    {stu.rollNumber} &bull; {stu.stopName}
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
          No students found for your account. Please contact your administrator.
        </div>
      )}

      {!loading && students.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

            {/* Main Map Column */}
            <div style={{ gridColumn: 'span 2 / span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Live School Bus Map
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {activeTrip
                        ? <>Trip #{activeTrip.tripId} is active &bull; Polling every 3 seconds</>
                        : 'Waiting for an active trip to begin tracking...'}
                    </p>
                  </div>

                  {busLocation && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-yellow)' }}>
                          {Math.round(busLocation.speed || 0)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>km/h</span>
                        </div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>CURRENT SPEED</div>
                      </div>
                    </div>
                  )}
                </div>

                {!activeTrip && (
                  <div style={{ background: 'var(--yellow-light)', color: '#b45309', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid var(--yellow-border)' }}>
                    <Radio size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    No active trip. The map will update automatically when the driver starts a trip.
                  </div>
                )}

                {/* Map */}
                <BusMap
                  busLocation={busLocation}
                  routeStops={routeStops}
                  activeBusNumber="BUS"
                  height="460px"
                />
              </div>
            </div>

            {/* Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Student & Stop Profile Card */}
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
                        {selectedStudent.rollNumber}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pickup/Drop Stop:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedStudent.stopName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Parent Name:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedStudent.parentName}</strong>
                    </div>
                    {busLocation && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Next Stop:</span>
                        <span style={{ fontWeight: 600, color: 'var(--yellow-hover)' }}>{busLocation.nextStopName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Tracking Status Card */}
              <div className="card">
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} style={{ color: 'var(--primary-yellow)' }} /> Live Tracking Status
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Trip Status:</span>
                    <span className={`badge ${activeTrip ? 'badge-green' : 'badge-yellow'}`}>
                      {activeTrip ? 'ACTIVE' : 'NO ACTIVE TRIP'}
                    </span>
                  </div>
                  {busLocation && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Speed:</span>
                        <span style={{ fontWeight: 700 }}>{Math.round(busLocation.speed || 0)} km/h</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Next Stop:</span>
                        <span style={{ fontWeight: 700 }}>{busLocation.nextStopName}</span>
                      </div>
                      {busLocation.distanceToNextStop !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Distance:</span>
                          <span style={{ fontWeight: 700 }}>{Math.round(busLocation.distanceToNextStop)} m</span>
                        </div>
                      )}
                    </>
                  )}
                  {!busLocation && activeTrip && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Waiting for first telemetry packet...</div>
                  )}
                </div>
              </div>

              {/* In-App Alerts Feed */}
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
                          background: al.type === 'success' ? 'var(--success-light)' : 'var(--bg-page)',
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
        </div>
      )}
    </div>
  );
}
