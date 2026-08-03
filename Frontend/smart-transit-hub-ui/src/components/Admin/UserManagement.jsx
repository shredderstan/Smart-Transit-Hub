import React, { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { adminAPI } from '../../api/client';

export default function UserManagement({ users, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [uUsername, setUUsername] = useState('');
  const [uFullName, setUFullName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState('ROLE_PARENT');

  const resetForm = () => {
    setShowModal(false);
    setUUsername('');
    setUFullName('');
    setUPhone('');
    setUPassword('');
    setURole('ROLE_PARENT');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser({
        username: uUsername,
        fullName: uFullName,
        phoneNumber: uPhone,
        password: uPassword,
        plainPassword: uPassword,
        role: uRole,
      });
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await adminAPI.deleteUser(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div>
      <div className="section-header">
        <h3 className="section-title">Manage Users</h3>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>#{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>{u.fullName}</td>
                <td>{u.phoneNumber}</td>
                <td>
                  <span className="badge badge-yellow">{u.role}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDeleteUser(u.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="table-empty-cell">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Create User</h3>
              <button onClick={resetForm} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateUser}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input-control" value={uFullName} onChange={(e) => setUFullName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input className="input-control" value={uUsername} onChange={(e) => setUUsername(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input type="password" className="input-control" value={uPassword} onChange={(e) => setUPassword(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input-control" value={uPhone} onChange={(e) => setUPhone(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select className="input-control" value={uRole} onChange={(e) => setURole(e.target.value)}>
                    <option value="ROLE_PARENT">Parent</option>
                    <option value="ROLE_DRIVER">Driver</option>
                    <option value="ROLE_ADMIN">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create User</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
