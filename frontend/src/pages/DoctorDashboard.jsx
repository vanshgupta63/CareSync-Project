import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, Clock, ChevronRight, Brain, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card card-hover">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ width: 38, height: 38, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>{sub}</div>}
  </div>
);

const statusClass = { pending: 'badge-warning', confirmed: 'badge-success', completed: 'badge-info', cancelled: 'badge-danger' };

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/mine').then(res => {
      setAppointments(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === today);
  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed');

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}/status`, { status });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  return (
    <DashboardLayout>
      <div className="fade-in-up">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Welcome, Dr. {user?.name?.split(' ')[0]} 👨‍⚕️
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.specialization || 'General Physician'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard icon={Calendar} label="Today" value={todayAppts.length} color="#3b82f6" sub="appointments today" />
          <StatCard icon={Clock} label="Pending" value={pending.length} color="#f59e0b" sub="awaiting confirmation" />
          <StatCard icon={CheckCircle} label="Confirmed" value={confirmed.length} color="#10b981" sub="ready for consultation" />
          <StatCard icon={Users} label="Completed" value={completed.length} color="#8b5cf6" sub="consultations done" />
        </div>

        {/* Appointment Queue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700 }}>Appointment Queue</h2>
              <Link to="/patient/appointments" style={{ color: '#60a5fa', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No appointments yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {appointments.slice(0, 8).map(appt => (
                  <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
                      {appt.patient?.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{appt.patient?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(appt.date).toLocaleDateString()} at {appt.time} • {appt.type}</div>
                      {appt.reason && <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 2, fontStyle: 'italic' }}>{appt.reason}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                      <span className={`badge ${statusClass[appt.status]}`}>{appt.status}</span>
                      {appt.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => updateStatus(appt._id, 'confirmed')} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, cursor: 'pointer' }}>Confirm</button>
                          <button onClick={() => updateStatus(appt._id, 'cancelled')} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      )}
                      {appt.status === 'confirmed' && (
                        <button onClick={() => updateStatus(appt._id, 'completed')} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, cursor: 'pointer' }}>Mark Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Assist Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 38, height: 38, background: 'rgba(139,92,246,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={20} color="#a78bfa" />
                </div>
                <h3 style={{ fontWeight: 700 }}>AI Diagnosis Aid</h3>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Get AI-powered suggestions based on patient symptoms. Enter symptoms in the chat to receive differential diagnosis insights.
              </p>
              <Link to="/chat" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: '0.875rem' }}>
                Open AI Chat
              </Link>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Activity size={18} color="#10b981" />
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Quick Actions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: '📋 Write Prescription', to: '/patient/records' },
                  { label: '📁 View Patient Records', to: '/patient/records' },
                  { label: '💬 Message Patient', to: '/chat' },
                ].map(({ label, to }) => (
                  <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, textDecoration: 'none', color: '#94a3b8', fontSize: '0.875rem', transition: 'all 0.2s' }}>
                    {label} <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
