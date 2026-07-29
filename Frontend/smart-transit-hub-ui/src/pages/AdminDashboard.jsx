import React, { useState, useEffect } from 'react';
import { Users, Bus, Route, GraduationCap, Plus, Trash2, MapPin, Search, Radio } from 'lucide-react';
import { adminAPI } from '../api/client';
import PlaceSearchInput from '../components/Places/PlaceSearchInput';
import StopPickerMap from '../components/Map/StopPickerMap';
import BusMap from '../components/Map/BusMap';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [previewRouteId, setPreviewRouteId] = useState(null);

  // Live Fleet Tracking state for Admin
  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedAdminTrip, setSelectedAdminTrip] = useState(null);
  const [adminBusLocation, setAdminBusLocation] = useState(null);
  const [adminRouteStops, setAdminRouteStops] = useState([]);

  // Data state
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // User form
  const [uUsername, setUUsername] = useState('');
  const [uFullName, setUFullName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState('ROLE_PARENT');

  // Bus form
  const [bNumber, setBNumber] = useState('');
  const [bPlate, setBPlate] = useState('');
  const [bCapacity, setBCapacity] = useState(40);
  const [bDriverId, setBDriverId] = useState('');
  const [bRouteId, setBRouteId] = useState('');

  // Route form
  const [rName, setRName] = useState('');

  // Stop form
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [stopName, setStopName] = useState('');
  const [stopLat, setStopLat] = useState('');
  const [stopLng, setStopLng] = useState('');

  // Student form
  const [stFirstName, setStFirstName] = useState('');
  const [stLastName, setStLastName] = useState('');
  const [stRoll, setStRoll] = useState('');
  const [stParentId, setStParentId] = useState('');
  const [stStopId, setStStopId] = useState('');

  // Load initial management data
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

  // Poll active trips when Admin switches to Live Tracking tab
  useEffect(() => {
    if (activeTab === 'tracking') {
      const fetchActive = async () => {
        try {
          const trips = await adminAPI.getActiveTrips();
          setActiveTrips(trips || []);
          if (trips && trips.length > 0) {
            setSelectedAdminTrip((prev) => {
              if (!prev) return trips[0];
              const match = trips.find((t) => t.tripId === prev.tripId);
              return match || trips[0];
            });
          } else {
            setSelectedAdminTrip(null);
            setAdminBusLocation(null);
          }
        } catch (e) {
          console.warn('Active trips poll error', e);
        }
      };
      fetchActive();
      const timer = setInterval(fetchActive, 3000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  // Load route stops ONCE when selected trip's routeId changes
  useEffect(() => {
    if (activeTab === 'tracking' && selectedAdminTrip?.routeId) {
      adminAPI.getStops(selectedAdminTrip.routeId)
        .then((stops) => setAdminRouteStops(stops || []))
        .catch((e) => console.warn('Could not load admin route stops', e));
    } else {
      setAdminRouteStops([]);
    }
  }, [activeTab, selectedAdminTrip?.routeId]);

  // Poll live coordinates every 2 seconds for selected admin trip
  useEffect(() => {
    if (activeTab === 'tracking' && selectedAdminTrip?.tripId) {
      const fetchLive = async () => {
        try {
          const latest = await adminAPI.getLatestTripData(selectedAdminTrip.tripId);
          if (latest && latest.latitude !== undefined && latest.longitude !== undefined && latest.latitude !== null && latest.longitude !== null) {
            setAdminBusLocation({
              latitude: latest.latitude,
              longitude: latest.longitude,
              speed: latest.speed,
              nextStopName: latest.nextStopName,
              nextStopId: latest.nextStopId,
              distanceToNextStop: latest.distanceToNextStop,
            });
          }
        } catch (e) {
          console.warn('Admin trip telemetry error', e);
        }
      };
      fetchLive();
      const timer = setInterval(fetchLive, 2000);
      return () => clearInterval(timer);
    }
  }, [activeTab, selectedAdminTrip?.tripId]);

  const resetModal = () => {
    setShowModal(false);
    setUUsername(''); setUFullName(''); setUPhone(''); setUPassword(''); setURole('ROLE_PARENT');
    setBNumber(''); setBPlate(''); setBCapacity(40); setBDriverId(''); setBRouteId('');
    setRName('');
    setSelectedRouteId(''); setStopName(''); setStopLat(''); setStopLng('');
    setStFirstName(''); setStLastName(''); setStRoll(''); setStParentId(''); setStStopId('');
  };

  // Submit User
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
      resetModal();
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user.');
    }
  };

  // Submit Bus
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
      resetModal();
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create bus.');
    }
  };

  // Submit Route
  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createRoute({ routeName: rName });
      resetModal();
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create route.');
    }
  };

  // Submit Stop
  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) {
      alert('Please select a route.');
      return;
    }
    try {
      const routeId = parseInt(selectedRouteId, 10);
      const currentStops = await adminAPI.getStops(routeId);
       const newStops = //[
      //   ...currentStops,
        {
          stopName,
          latitude: parseFloat(stopLat),
          longitude: parseFloat(stopLng),
          sequenceOrder: currentStops.length + 1,
         }
      // ];
      await adminAPI.saveStops(routeId, newStops);
      resetModal();
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add stop.');
    }
  };

  // Submit Student
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
      resetModal();
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register student.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await adminAPI.deleteUser(id);
        loadAllData();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Delete this bus?')) {
      try {
        await adminAPI.deleteBus(id);
        loadAllData();
      } catch (err) {
        alert('Failed to delete bus.');
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Delete student record?')) {
      try {
        await adminAPI.deleteStudent(id);
        loadAllData();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

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
            <span className="badge badge-yellow">ADMINISTRATION</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Fleet &amp; User Management</span>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'var(--yellow-light)', color: 'var(--yellow-hover)', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{users.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total System Users</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'var(--success-light)', color: '#047857', borderRadius: 'var(--radius-md)' }}>
            <Bus size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{buses.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Fleet Buses</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'var(--info-light)', color: '#1d4ed8', borderRadius: 'var(--radius-md)' }}>
            <Route size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{routes.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Configured Routes</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'var(--yellow-light)', color: 'var(--yellow-hover)', borderRadius: 'var(--radius-md)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{students.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered Students</div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Management Panel */}
      <div className="card">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '1.25rem', overflowX: 'auto' }}>
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
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Manage Users</h3>
              <button onClick={() => { setModalType('user'); setShowModal(true); }} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add User
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-page)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px' }}>ID</th>
                    <th style={{ padding: '10px 12px' }}>Username</th>
                    <th style={{ padding: '10px 12px' }}>Full Name</th>
                    <th style={{ padding: '10px 12px' }}>Phone</th>
                    <th style={{ padding: '10px 12px' }}>Role</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>#{u.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.username}</td>
                      <td style={{ padding: '10px 12px' }}>{u.fullName}</td>
                      <td style={{ padding: '10px 12px' }}>{u.phoneNumber}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-yellow">{u.role}</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteUser(u.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Buses */}
        {activeTab === 'buses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Manage Buses</h3>
              <button onClick={() => { setModalType('bus'); setShowModal(true); }} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Bus
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-page)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px' }}>Bus #</th>
                    <th style={{ padding: '10px 12px' }}>Plate #</th>
                    <th style={{ padding: '10px 12px' }}>Capacity</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Driver</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Route</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--primary-yellow)' }}>{b.busNumber}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{b.plateNumber}</td>
                      <td style={{ padding: '10px 12px' }}>{b.capacity} seats</td>
                      <td style={{ padding: '10px 12px' }}>{b.driverName || `Driver #${b.driverId}`}</td>
                      <td style={{ padding: '10px 12px' }}>{b.routeName || `Route #${b.routeId}`}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteBus(b.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {buses.length === 0 && !loading && (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No buses found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Routes & Stops */}
        {activeTab === 'routes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Routes &amp; Stop Geofencing</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Click a route to view its OpenStreetMap path and stop markers</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setModalType('stop'); setShowModal(true); }} className="btn btn-secondary btn-sm">
                  <MapPin size={16} /> Add Stop
                </button>
                <button onClick={() => { setModalType('route'); setShowModal(true); }} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Create Route
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: routes.length > 0 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
              {/* Route List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {routes.map((r) => {
                  const isSelected = previewRouteId === r.id || (!previewRouteId && routes[0]?.id === r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => setPreviewRouteId(r.id)}
                      style={{
                        border: isSelected ? '2px solid var(--primary-yellow)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        background: isSelected ? 'var(--yellow-light)' : 'var(--bg-page)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {r.routeName}
                        </h4>
                        <span className="badge badge-yellow">Route #{r.id}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Total Geofenced Stops: {r.stops ? r.stops.length : 0}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {r.stops && r.stops.map((s, idx) => (
                          <div key={s.id} style={{ padding: '6px 10px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>Stop {idx + 1}:</strong> {s.stopName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {routes.length === 0 && !loading && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No routes configured yet. Create a route to start adding stops!</div>
                )}
              </div>

              {/* OpenStreetMap Route Visualizer */}
              {routes.length > 0 && (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#ffffff' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} style={{ color: 'var(--primary-yellow)' }} />
                    OpenStreetMap Route Map: {routes.find(r => r.id === (previewRouteId || routes[0]?.id))?.routeName}
                  </h4>
                  <BusMap
                    routeStops={routes.find(r => r.id === (previewRouteId || routes[0]?.id))?.stops || []}
                    activeBusNumber="ROUTE-PREVIEW"
                    height="420px"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Live Fleet Map (Admin) */}
        {activeTab === 'tracking' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Live Fleet Tracking Map</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Real-time OpenStreetMap tracking for all active system trips</p>
              </div>
              {activeTrips.length > 0 && (
                <span className="badge badge-green">
                  <Radio size={12} className="animate-pulse" /> {activeTrips.length} ACTIVE {activeTrips.length === 1 ? 'BUS' : 'BUSES'} STREAMING
                </span>
              )}
            </div>

            {activeTrips.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
                <Radio size={32} style={{ color: 'var(--primary-yellow)', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>No Active Bus Trips</h4>
                <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>When a driver initializes a trip, live tracking will automatically connect to OpenStreetMap here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.25rem' }}>
                {/* Active Bus Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Active Vehicle:</label>
                  {activeTrips.map((t) => {
                    const isSelected = selectedAdminTrip?.tripId === t.tripId;
                    return (
                      <div
                        key={t.tripId}
                        onClick={() => setSelectedAdminTrip(t)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary-yellow)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--yellow-light)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>{t.busNumber}</span>
                          <span className="badge badge-yellow">Trip #{t.tripId}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Route: <strong>{t.routeName}</strong> &bull; Driver: {t.driverName}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* OpenStreetMap Vehicle Tracker */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#ffffff' }}>
                  {selectedAdminTrip && (
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Live Location: {selectedAdminTrip.busNumber} ({selectedAdminTrip.routeName})
                      </h4>
                      {adminBusLocation && (
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--yellow-hover)' }}>
                          Speed: {Math.round(adminBusLocation.speed || 0)} km/h &bull; Next: {adminBusLocation.nextStopName || 'En Route'}
                        </div>
                      )}
                    </div>
                  )}
                  <BusMap
                    busLocation={adminBusLocation}
                    routeStops={adminRouteStops}
                    activeBusNumber={selectedAdminTrip?.busNumber || 'BUS'}
                    height="460px"
                  />
                </div>
              </div>
            )}
          </div>
        )}


        {/* Tab 5: Students */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Student Registry</h3>
              <button onClick={() => { setModalType('student'); setShowModal(true); }} className="btn btn-primary btn-sm">
                <Plus size={16} /> Register Student
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-page)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px' }}>Roll #</th>
                    <th style={{ padding: '10px 12px' }}>Student Name</th>
                    <th style={{ padding: '10px 12px' }}>Parent Name</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Stop</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{s.rollNumber}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{s.firstName} {s.lastName}</td>
                      <td style={{ padding: '10px 12px' }}>{s.parentName}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-yellow">{s.stopName}</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteStudent(s.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && !loading && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students registered.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'capitalize' }}>
                {modalType === 'stop' ? 'Add Stop to Route' : `Create ${modalType}`}
              </h3>
              <button onClick={resetModal} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {modalType === 'user' && (
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
              )}

              {modalType === 'bus' && (
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
              )}

              {modalType === 'route' && (
                <form onSubmit={handleCreateRoute}>
                  <div className="input-group">
                    <label className="input-label">Route Name</label>
                    <input className="input-control" value={rName} onChange={(e) => setRName(e.target.value)} placeholder="e.g. Route C - Northside Express" required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Route</button>
                </form>
              )}

              {modalType === 'stop' && (
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
              )}

              {modalType === 'student' && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
