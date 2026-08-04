import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { adminAPI } from '../../api/client';

export default function StudentManagement({ students, users, routes, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [stFirstName, setStFirstName] = useState('');
  const [stLastName, setStLastName] = useState('');
  const [stRoll, setStRoll] = useState('');
  const [stParentId, setStParentId] = useState('');
  const [stStopId, setStStopId] = useState('');

  const resetForm = () => {
    setShowModal(false);
    setStFirstName('');
    setStLastName('');
    setStRoll('');
    setStParentId('');
    setStStopId('');
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!stParentId || !stStopId) {
      alert('Please select both a parent and a stop.');
      return;
    }
    try {
      await adminAPI.createStudent({
        firstName: stFirstName,
        lastName: stLastName,
        rollNumber: stRoll,
        parentId: parseInt(stParentId, 10),
        stopId: parseInt(stStopId, 10),
      });
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register student.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Delete student record?')) {
      try {
        await adminAPI.deleteStudent(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  return (
    <div>
      <div className="section-header">
        <h3 className="section-title">Student Registry</h3>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Register Student
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll #</th>
              <th>Student Name</th>
              <th>Parent Name</th>
              <th>Assigned Stop</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700 }}>{s.rollNumber}</td>
                <td style={{ fontWeight: 700 }}>{s.firstName} {s.lastName}</td>
                <td>{s.parentName}</td>
                <td>
                  <span className="badge badge-yellow">{s.stopName}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDeleteStudent(s.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="table-empty-cell">No students registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Register Student</h3>
              <button onClick={resetForm} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateStudent}>
                <div className="input-group">
                  <label className="input-label">First Name</label>
                  <input className="input-control" value={stFirstName} onChange={(e) => setStFirstName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Last Name</label>
                  <input className="input-control" value={stLastName} onChange={(e) => setStLastName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Roll Number</label>
                  <input className="input-control" value={stRoll} onChange={(e) => setStRoll(e.target.value)} placeholder="e.g. STU-9901" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Select Parent</label>
                  <select className="input-control" value={stParentId} onChange={(e) => setStParentId(e.target.value)} required>
                    <option value="">-- Select Parent --</option>
                    {users.filter(u => u.role === 'ROLE_PARENT').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.username} (ID: #{u.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Select Assigned Stop</label>
                  <select className="input-control" value={stStopId} onChange={(e) => setStStopId(e.target.value)} required>
                    <option value="">-- Select Stop --</option>
                    {routes.flatMap(r => (r.stops || []).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.stopName} ({r.routeName})
                      </option>
                    )))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Student</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
