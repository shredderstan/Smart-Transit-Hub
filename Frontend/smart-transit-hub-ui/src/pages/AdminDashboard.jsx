import React, { useState, useEffect } from 'react';
import { Users, Bus, Route, GraduationCap, Radio } from 'lucide-react';
import { adminAPI } from '../api/client';
import UserManagement from '../components/Admin/UserManagement';
import BusManagement from '../components/Admin/BusManagement';
import RouteManagement from '../components/Admin/RouteManagement';
import StudentManagement from '../components/Admin/StudentManagement';
import LiveFleetMonitor from '../components/Admin/LiveFleetMonitor';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uData, bData, rData, stData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getBuses(),
        adminAPI.getRoutes(),
        adminAPI.getStudents(),
      ]);

      setUsers(uData);
      setBuses(bData);

      // Fetch stops for each route so route cards can display their stops
      const routesWithStops = await Promise.all(
        (rData || []).map(async (route) => {
          try {
            const stops = await adminAPI.getStops(route.id);
            return { ...route, stops };
          } catch {
            return { ...route, stops: [] };
          }
        })
      );
      setRoutes(routesWithStops);
      setStudents(stData);
    } catch (err) {
      setError('Failed to load data. Please check your connection and try again.');
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {/* Top Banner */}
      <div className="admin-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-yellow">ADMINISTRATION</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Fleet &amp; User Management</span>
          </div>
          <h2 className="admin-banner-title">
            System Master Dashboard
          </h2>
        </div>
        <button onClick={loadAllData} className="btn btn-secondary btn-sm" disabled={loading}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: '#b91c1c', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div className="analytics-grid">
        <div className="card analytics-card">
          <div className="analytics-icon-wrapper analytics-icon-yellow">
            <Users size={24} />
          </div>
          <div>
            <div className="analytics-count">{users.length}</div>
            <div className="analytics-label">Total System Users</div>
          </div>
        </div>
        <div className="card analytics-card">
          <div className="analytics-icon-wrapper analytics-icon-green">
            <Bus size={24} />
          </div>
          <div>
            <div className="analytics-count">{buses.length}</div>
            <div className="analytics-label">Active Fleet Buses</div>
          </div>
        </div>
        <div className="card analytics-card">
          <div className="analytics-icon-wrapper analytics-icon-blue">
            <Route size={24} />
          </div>
          <div>
            <div className="analytics-count">{routes.length}</div>
            <div className="analytics-label">Configured Routes</div>
          </div>
        </div>
        <div className="card analytics-card">
          <div className="analytics-icon-wrapper analytics-icon-yellow">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="analytics-count">{students.length}</div>
            <div className="analytics-label">Registered Students</div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Management Panel */}
      <div className="card">
        {/* Navigation Tabs */}
        <div className="tab-navigation">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'buses', label: 'Buses Fleet', icon: Bus },
            { id: 'routes', label: 'Routes & Stops', icon: Route },
            { id: 'tracking', label: 'Live Fleet Map', icon: Radio },
            { id: 'students', label: 'Students', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} tab-btn`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Components */}
        {activeTab === 'users' && (
          <UserManagement users={users} loading={loading} onRefresh={loadAllData} />
        )}

        {activeTab === 'buses' && (
          <BusManagement buses={buses} users={users} routes={routes} loading={loading} onRefresh={loadAllData} />
        )}

        {activeTab === 'routes' && (
          <RouteManagement routes={routes} loading={loading} onRefresh={loadAllData} />
        )}

        {activeTab === 'tracking' && (
          <LiveFleetMonitor />
        )}

        {activeTab === 'students' && (
          <StudentManagement students={students} users={users} routes={routes} loading={loading} onRefresh={loadAllData} />
        )}
      </div>
    </div>
  );
}
