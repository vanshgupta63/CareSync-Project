import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import socket from '../lib/socket';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      socket.connect();
      socket.emit('user:online', data._id);
      if (data.role === 'doctor') navigate('/doctor');
      else if (data.role === 'admin') navigate('/admin');
      else navigate('/patient');
    } catch (err) {
      if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareSync</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: '1.25rem', padding: '2rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>

        {/* Demo credentials */}
        <div style={{ marginTop: '1.5rem', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>🧪 Demo Credentials</div>
          <div>Patient: patient@demo.com / demo123</div>
          <div>Doctor: doctor@demo.com / demo123</div>
          <div>Admin: admin@demo.com / demo123</div>
        </div>
      </div>
    </div>
  );
}
