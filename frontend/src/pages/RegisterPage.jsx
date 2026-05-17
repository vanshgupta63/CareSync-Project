import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Stethoscope, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const roles = [
  { value: 'patient', label: 'Patient', icon: User, desc: 'Book appointments & manage health' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients & consultations' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'System management & analytics' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      if (data.role === 'doctor') navigate('/doctor');
      else if (data.role === 'admin') navigate('/admin');
      else navigate('/patient');
    } catch (err) {
      if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareSync</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Join CareSync and take control of your health journey</p>
        </div>

        <div className="glass" style={{ borderRadius: '1.25rem', padding: '2rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>I am a</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {roles.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  style={{
                    padding: '0.875rem 0.5rem',
                    borderRadius: 10,
                    border: `2px solid ${form.role === value ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                    background: form.role === value ? 'rgba(59,130,246,0.12)' : 'rgba(15,23,42,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    color: form.role === value ? '#60a5fa' : '#64748b',
                  }}
                >
                  <Icon size={20} style={{ margin: '0 auto 0.4rem' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <input className="input-field" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            {form.role === 'doctor' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialization</label>
                <input className="input-field" type="text" placeholder="e.g. Cardiology, Neurology" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input className="input-field" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
