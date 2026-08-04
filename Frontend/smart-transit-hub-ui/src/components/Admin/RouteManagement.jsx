import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { adminAPI } from '../../api/client';
import PlaceSearchInput from '../Places/PlaceSearchInput';
import StopPickerMap from '../Map/StopPickerMap';
import BusMap from '../Map/BusMap';

export default function RouteManagement({ routes, loading, onRefresh }) {
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [previewRouteId, setPreviewRouteId] = useState(null);

  // Route form
  const [rName, setRName] = useState('');

  // Stop form
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [stopName, setStopName] = useState('');
  const [stopLat, setStopLat] = useState('');
  const [stopLng, setStopLng] = useState('');

  const resetRouteForm = () => {
    setShowRouteModal(false);
    setRName('');
  };

  const resetStopForm = () => {
    setShowStopModal(false);
    setSelectedRouteId('');
    setStopName('');
    setStopLat('');
    setStopLng('');
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createRoute({ routeName: rName });
      resetRouteForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create route.');
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) {
      alert('Please select a route.');
      return;
    }
    try {
      const routeId = parseInt(selectedRouteId, 10);
      const currentStops = await adminAPI.getStops(routeId);
      const newStops = {
        stopName,
        latitude: parseFloat(stopLat),
        longitude: parseFloat(stopLng),
        sequenceOrder: currentStops.length + 1,
      };
      await adminAPI.saveStops(routeId, newStops);
      resetStopForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add stop.');
    }
  };

  const activeRouteId = previewRouteId || routes[0]?.id;
  const activeRoute = routes.find(r => r.id === activeRouteId);
  const activeRouteStops = activeRoute?.stops || [];

  return (
    <div>
      <div className="section-header">
        <div>
          <h3 className="section-title">Routes &amp; Stop Geofencing</h3>
          <p className="section-subtitle">Click a route to view its OpenStreetMap path and stop markers</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowStopModal(true)} className="btn btn-secondary btn-sm">
            <MapPin size={16} /> Add Stop
          </button>
          <button onClick={() => setShowRouteModal(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> Create Route
          </button>
        </div>
      </div>

      <div className="routes-grid">
        {/* Route List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {routes.map((r) => {
            const isSelected = activeRouteId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setPreviewRouteId(r.id)}
                className={`route-card ${isSelected ? 'route-card-selected' : 'route-card-default'}`}
              >
                <div className="route-card-header">
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {r.routeName}
                  </h4>
                  <span className="badge badge-yellow">Route #{r.id}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Total Geofenced Stops: {r.stops ? r.stops.length : 0}
                </div>
                <div className="route-stops-list">
                  {r.stops && r.stops.map((s, idx) => (
                    <div key={s.id} className="route-stop-item">
                      <span><strong>Stop {idx + 1}:</strong> {s.stopName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {routes.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No routes configured yet. Create a route to start adding stops!
            </div>
          )}
        </div>

        {/* OpenStreetMap Route Visualizer */}
        {routes.length > 0 && (
          <div className="map-card-wrapper">
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: 'var(--primary-yellow)' }} />
              OpenStreetMap Route Map: {activeRoute?.routeName}
            </h4>
            <BusMap
              routeStops={activeRouteStops}
              activeBusNumber="ROUTE-PREVIEW"
              height="420px"
            />
          </div>
        )}
      </div>

      {/* Create Route Modal */}
      {showRouteModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Create Route</h3>
              <button onClick={resetRouteForm} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateRoute}>
                <div className="input-group">
                  <label className="input-label">Route Name</label>
                  <input className="input-control" value={rName} onChange={(e) => setRName(e.target.value)} placeholder="e.g. Route C - Northside Express" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Route</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showStopModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add Stop to Route</h3>
              <button onClick={resetStopForm} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddStop}>
                <div className="input-group">
                  <label className="input-label">Select Route</label>
                  <select className="input-control" value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)} required>
                    <option value="">-- Select a Route --</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Search Location (OpenSource Places API)</label>
                  <PlaceSearchInput
                    onSelectPlace={(place) => {
                      setStopName(place.name);
                      setStopLat(place.latitude.toString());
                      setStopLng(place.longitude.toString());
                    }}
                    placeholder="Search (e.g. ABC Public School)..."
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Search any location. Selecting a result auto-fills Name, Latitude &amp; Longitude.
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Stop Name</label>
                  <input className="input-control" value={stopName} onChange={(e) => setStopName(e.target.value)} placeholder="e.g. ABC Public School" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="input-group">
                    <label className="input-label">Latitude</label>
                    <input type="number" step="any" className="input-control" value={stopLat} onChange={(e) => setStopLat(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Longitude</label>
                    <input type="number" step="any" className="input-control" value={stopLng} onChange={(e) => setStopLng(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Pick Location on OpenStreetMap</label>
                  <StopPickerMap
                    latitude={stopLat}
                    longitude={stopLng}
                    onSelectLocation={({ latitude, longitude }) => {
                      setStopLat(latitude.toString());
                      setStopLng(longitude.toString());
                    }}
                    height="200px"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>Save Stop</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
