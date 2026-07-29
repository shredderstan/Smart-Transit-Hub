import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Zap, Radio } from 'lucide-react';
import { fetchRealRoadRoutePath } from '../../utils/routeUtils';
import { driverAPI } from '../../api/client';

export default function TripSimulatorControls({ routeStops, busNumber = 'BUS', tripId, onLocationUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pathPoints, setPathPoints] = useState([]);
  const [telemetryState, setTelemetryState] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const timerRef = useRef(null);

  // Helper to stream telemetry to backend & parent callback
  const sendTelemetryPacket = (point, speedValue = 0) => {
    if (!point || !tripId) return;
    const locationData = {
      tripId: tripId,
      busNumber: busNumber,
      latitude: point.latitude,
      longitude: point.longitude,
      speed: speedValue,
      nextStopName: point.nextStopName,
      nextStopId: point.nextStopId,
      stopIndex: point.stopIndex || 1,
    };

    driverAPI.streamTelemetry(locationData)
      .then((resp) => {
        setTelemetryState(resp);
        onLocationUpdate && onLocationUpdate({
          ...locationData,
          distanceToNextStop: resp?.distanceToNextStop,
        });
      })
      .catch((err) => {
        console.error('Telemetry stream error', err);
        onLocationUpdate && onLocationUpdate(locationData);
      });
  };

  // Generate real geographical road path points whenever stops change
  useEffect(() => {
    if (routeStops && routeStops.length > 0) {
      setIsRouting(true);
      fetchRealRoadRoutePath(routeStops)
        .then((generated) => {
          setPathPoints(generated);
          setCurrentIndex(0);
          if (generated.length > 0) {
            sendTelemetryPacket(generated[0], 0);
          }
        })
        .finally(() => setIsRouting(false));
    }
  }, [routeStops, tripId, busNumber]);

  // Simulation loop
  useEffect(() => {
    if (!isPlaying || pathPoints.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(80, 1200 / speedMultiplier);

    timerRef.current = setInterval(async () => {
      setCurrentIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % pathPoints.length;
        const currentPoint = pathPoints[nextIdx];

        // Simulated speed following realistic acceleration and turns
        const baseSpeed = (Math.sin(nextIdx / 3) * 12) + 38; // ~26 to 50 km/h
        const currentSpeed = nextIdx === pathPoints.length - 1 ? 0 : baseSpeed * Math.min(speedMultiplier, 2);

        sendTelemetryPacket(currentPoint, currentSpeed);

        // Auto-pause at end of route
        if (nextIdx === pathPoints.length - 1) {
          setIsPlaying(false);
        }

        return nextIdx;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, pathPoints, speedMultiplier, tripId, busNumber]);

  const handleSliderChange = (e) => {
    const newIdx = parseInt(e.target.value, 10);
    setCurrentIndex(newIdx);
    if (pathPoints[newIdx]) {
      sendTelemetryPacket(pathPoints[newIdx], isPlaying ? 35 : 0);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (pathPoints[0]) {
      sendTelemetryPacket(pathPoints[0], 0);
    }
  };

  const progressPercent = pathPoints.length > 0 ? Math.round(((currentIndex + 1) / pathPoints.length) * 100) : 0;
  const currentPoint = pathPoints[currentIndex];

  return (
    <div className="card" style={{ border: '1px solid var(--primary-yellow)', background: 'var(--yellow-soft)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--primary-yellow)' }} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
            OpenStreetMap Geographical Simulator
          </h3>
        </div>
        <span className="badge badge-yellow">
          <Radio size={12} className={isPlaying ? 'animate-pulse' : ''} />
          {isRouting ? ' CALCULATING ROADS...' : isPlaying ? ' STREAMING' : ' PAUSED'}
        </span>
      </div>

      {/* Control Buttons & Speed */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
          style={{ minWidth: '130px' }}
          disabled={isRouting || pathPoints.length === 0}
        >
          {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start Simulation</>}
        </button>

        <button onClick={handleReset} className="btn btn-secondary btn-sm" title="Reset to start">
          <RotateCcw size={14} /> Reset
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', background: '#ffffff', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <FastForward size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>SPEED:</span>
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              style={{
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: speedMultiplier === s ? 'var(--primary-yellow)' : 'transparent',
                color: speedMultiplier === s ? '#1e1b4b' : 'var(--text-main)',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Slider */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Road Navigation Progress: {progressPercent}%</span>
          <span>{currentPoint ? `Next: ${currentPoint.nextStopName}` : 'Computing geographical roads...'}</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, pathPoints.length - 1)}
          value={currentIndex}
          onChange={handleSliderChange}
          style={{ width: '100%', accentColor: 'var(--primary-yellow)', cursor: 'pointer' }}
        />
      </div>

      {/* Telemetry Feedback */}
      {telemetryState && (
        <div style={{
          background: '#ffffff',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Status: <span style={{ color: 'var(--yellow-hover)' }}>{telemetryState.statusMessage || 'En Route'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target: {telemetryState.nextStopName}
            </div>
          </div>
          {telemetryState.distanceToNextStop !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--primary-yellow)', fontSize: '0.9375rem' }}>
                {Math.round(telemetryState.distanceToNextStop)} m
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance Remaining</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
