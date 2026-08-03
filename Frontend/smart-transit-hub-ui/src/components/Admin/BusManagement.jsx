import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { adminAPI } from '../../api/client';

export default function BusManagement({ buses, users, routes, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [bNumber, setBNumber] = useState('');
  const [bPlate, setBPlate] = useState('');
  const [bCapacity, setBCapacity] = useState(40);
  const [bDriverId, setBDriverId] = useState('');
  const [bRouteId, setBRouteId] = useState('');

  const resetForm = () => {
    setShowModal(false);
    setBNumber('');
    setBPlate('');
    setBCapacity(40);
    setBDriverId('');
    setBRouteId('');
  };

  const handleCreateBus = async (e) => {
    e.preventDefault();
    if (!bDriverId || !bRouteId) {
      alert('Please select both a driver and a route.');
      return;
    }
    try {
      await adminAPI.createBus({
        busNumber: bNumber,
        plateNumber: bPlate,
        capacity: parseInt(bCapacity, 10),
        driverUserId: parseInt(bDriverId, 10),
        routeId: parseInt(bRouteId, 10),
      });
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create bus.');
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Delete this bus?')) {
      try {
        await adminAPI.deleteBus(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete bus.');
      }
    }
  };

  return (
    <div>
      <div className="section-header">
        <h3 className="section-title">Manage Buses</h3>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Bus
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bus #</th>
              <th>Plate #</th>
              <th>Capacity</th>
              <th>Assigned Driver</th>
              <th>Assigned Route</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 800, color: 'var(--primary-yellow)' }}>{b.busNumber}</td>
                <td style={{ fontWeight: 600 }}>{b.plateNumber}</td>
                <td>{b.capacity} seats</td>
                <td>{b.driverName || `Driver #${b.driverId}`}</td>
                <td>{b.routeName || `Route #${b.routeId}`}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDeleteBus(b.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {buses.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="table-empty-cell">No buses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Create Bus</h3>
              <button onClick={resetForm} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateBus}>
                <div className="input-group">
                  <label className="input-label">Bus Number</label>
                  <input className="input-control" value={bNumber} onChange={(e) => setBNumber(e.target.value)} placeholder="e.g. BUS-103" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Plate Number</label>
                  <input className="input-control" value={bPlate} onChange={(e) => setBPlate(e.target.value)} placeholder="e.g. MH-01-AB-1234" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Capacity</label>
                  <input type="number" className="input-control" value={bCapacity} onChange={(e) => setBCapacity(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Select Driver</label>
                  <select className="input-control" value={bDriverId} onChange={(e) => setBDriverId(e.target.value)} required>
                    <option value="">-- Select Driver --</option>
                    {users.filter(u => u.role === 'ROLE_DRIVER').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.username} (ID: #{u.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Select Route</label>
                  <select className="input-control" value={bRouteId} onChange={(e) => setBRouteId(e.target.value)} required>
                    <option value="">-- Select Route --</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.routeName} (ID: #{r.id})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Bus</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
