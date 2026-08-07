import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import ParentMapCard from '../components/Parent/ParentMapCard';
import StudentInfoCard from '../components/Parent/StudentInfoCard';
import TelemetryMonitorCard from '../components/Parent/TelemetryMonitorCard';
import ProximityAlertsCard from '../components/Parent/ProximityAlertsCard';
import { parentAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/ParentDashboard.css';
import Chatbot from '../components/Chatbot';
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase/firebase";

export default function ParentDashboard() {
  const { activeTrip: contextActiveTrip, setActiveTrip } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(contextActiveTrip || null);
  const [routeStops, setRouteStops] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch parent's registered student profiles on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await parentAPI.getStudents();
        setStudents(data || []);
        if (data && data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch student profiles. Ensure the server is online.');
        console.error('Error fetching parent students', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Poll active trip status for parent's route context every 3 seconds
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
    const activeTripId = currentTrip?.tripId || contextActiveTrip?.tripId;

    if (activeTripId) {
      // Load active trip stops
      parentAPI.getTripStops(activeTripId)
        .then((stops) => {
          if (isSubscribed && Array.isArray(stops)) {
            setRouteStops(stops);
          }
        })
        .catch((e) => console.warn('Could not load stops for active trip', e));
    } else if (selectedStudent?.routeId) {
      // Fallback: load static route stops for preview
      parentAPI.getRouteStops(selectedStudent.routeId)
        .then((stops) => {
          if (isSubscribed && Array.isArray(stops)) {
            setRouteStops(stops);
          }
        })
        .catch((e) => console.warn('Could not load stops for student route', e));
    }

    return () => { isSubscribed = false; };
  }, [currentTrip?.tripId, currentTrip?.routeId, contextActiveTrip?.tripId, selectedStudent?.routeId]);

  const currentTripRef = React.useRef(currentTrip);
  const contextActiveTripRef = React.useRef(contextActiveTrip);
  
  useEffect(() => { currentTripRef.current = currentTrip; }, [currentTrip]);
  useEffect(() => { contextActiveTripRef.current = contextActiveTrip; }, [contextActiveTrip]);

  // 4. Poll live telemetry coordinates & proximity alerts for active trip
  useEffect(() => {

    const unsubscribe = onMessage(messaging, (payload) => {

        console.log(payload);

        if (Notification.permission === "granted") {

            new Notification(
                payload.notification.title,
                {
                    body: payload.notification.body
                }
            );

        }

    });

    return unsubscribe;

}, []);

  // 4. Poll live vehicle telemetry continuously
  useEffect(() => {
    let timer;
    const activeTripId = currentTrip?.tripId || contextActiveTrip?.tripId;

    if (activeTripId) {
      const pollTelemetry = async () => {
        try {
          const activeTripIdVal = currentTripRef.current?.tripId || contextActiveTripRef.current?.tripId || 1;
          const latest = await parentAPI.getLatestTripData(activeTripIdVal);
          if (latest) {
            if (latest.latitude !== undefined && latest.longitude !== undefined && latest.latitude !== null && latest.longitude !== null) {
              setBusLocation({
                latitude: latest.latitude,
                longitude: latest.longitude,
                speed: latest.speed,
                nextStopName: latest.nextStopName,
                nextStopId: latest.nextStopId,
                distanceToNextStop: latest.distance,
              });
            }

            // Proximity notification check for selected child's stop
            if (selectedStudent?.stopId && latest.nextStopId === selectedStudent.stopId && latest.distance !== null) {
              const distance = latest.distance;
              const timestamp = new Date().toLocaleTimeString();

              if (distance <= 50.0) {
                setAlerts((prev) => {
                  const message = `Bus has arrived at your child's stop (${selectedStudent.stopName})!`;
                  if (prev.some((a) => a.message === message)) return prev;
                  return [{ message, timestamp, type: 'arrival' }, ...prev];
                });
              } else if (distance <= 500.0) {
                setAlerts((prev) => {
                  const message = `Bus is approaching your child's stop (${selectedStudent.stopName}) - ${Math.round(distance)}m away.`;
                  if (prev.some((a) => a.message === message)) return prev;
                  return [{ message, timestamp, type: 'proximity' }, ...prev];
                });
              }
            }
          }
        } catch (e) {
          console.warn('Telemetry polling error for parent', e);
        }
      };

      pollTelemetry();
      timer = setInterval(pollTelemetry, 2000);
    } else {
      setBusLocation(null);
    }

    return () => { if (timer) clearInterval(timer); };
  }, [currentTrip?.tripId, contextActiveTrip?.tripId, selectedStudent?.stopId, selectedStudent?.stopName]);

  const activeTripObj = currentTrip || contextActiveTrip;

  return (
    <div className="parent-container">
      {/* Top Banner */}
      <div className="parent-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-yellow">PARENT PORTAL</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>School Bus Live Tracking</span>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            Real-Time Vehicle Operations Map
          </h2>
        </div>

        {/* Student Profile Quick Switcher */}
        {students.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Child Profile:</span>
            <select
              className="input-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem', minWidth: '150px' }}
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const match = students.find((s) => s.id === parseInt(e.target.value, 10));
                if (match) setSelectedStudent(match);
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>
        )}
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
          No students registered.
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="parent-grid">

          {/* Left Column: Live School Bus Map */}
          <div className="parent-map-col">
            <ParentMapCard
              activeTripObj={activeTripObj}
              busLocation={busLocation}
              routeStops={routeStops}
            />
          </div>

          {/* Right Column: Status & Alerts Panel */}
          <div className="parent-sidebar-col">
            {/* Student Info Card */}
            <StudentInfoCard
              student={selectedStudent}
              busLocation={busLocation}
            />

            {/* Live Tracking Telemetry Card */}
            <TelemetryMonitorCard
              activeTripObj={activeTripObj}
              busLocation={busLocation}
            />

            {/* Proximity Alerts Feed */}
            <ProximityAlertsCard
              alerts={alerts}
            />
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
