import React, { useState } from 'react';
import { Bus, ArrowRight } from 'lucide-react';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Login state
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regUserName, setRegUserName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('ROLE_PARENT');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Decode JWT payload (base64url → JSON) to extract role & username
  // since the backend AuthResp only returns { userId, jwt }
  const decodeJwtPayload = (token) => {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Backend returns: { userId, jwt }
      const resp = await authAPI.login({ userName, password });
      const claims = decodeJwtPayload(resp.jwt);
      let role = claims.user_role || claims.role || '';
      if (role && !role.startsWith('ROLE_')) {
        role = 'ROLE_' + role;
      }
      const userData = {
        id: resp.userId,
        username: claims.sub || '',
        fullName: claims.sub || '',
        role: role,
      };
      login(userData, resp.jwt);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await authAPI.register({
        username: regUserName,
        plainPassword: regPassword,
        fullName: regFullName,
        phoneNumber: regPhone,
        role: regRole,
      });

      setSuccessMsg('Account created successfully! Please log in.');
      setIsRegister(false);
      setUserName(regUserName);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(180deg, #fffbe8 0%, #f8fafc 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            background: 'var(--primary-yellow)',
            color: '#1e1b4b',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-yellow)',
            marginBottom: '0.75rem'
          }}>
            <Bus size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Smart Transit <span style={{ color: 'var(--primary-yellow)' }}>Hub</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-Time School Bus Tracking &amp; Safety Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="card">
          {/* Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            background: 'var(--bg-page)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              style={{
                padding: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: !isRegister ? '#ffffff' : 'transparent',
                color: !isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              style={{
                padding: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: isRegister ? '#ffffff' : 'transparent',
                color: isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: isRegister ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--danger-light)',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'var(--success-light)',
              color: '#047857',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              {successMsg}
            </div>
          )}

          {!isRegister ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="input-control"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : <><span>Log In to Portal</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-control"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="input-control"
                  value={regUserName}
                  onChange={(e) => setRegUserName(e.target.value)}
                  placeholder="Choose a username"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-control"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  className="input-control"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 9999999999"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Role</label>
                <select
                  className="input-control"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                >
                  <option value="ROLE_PARENT">Parent</option>
                  <option value="ROLE_DRIVER">Driver</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
