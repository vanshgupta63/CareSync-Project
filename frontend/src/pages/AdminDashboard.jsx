import { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp, Trash2, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../lib/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card card-hover">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ width: 38, height: 38, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
  </div>
);

const roleBadge = { patient: 'badge-info', doctor: 'badge-success', admin: 'badge-warning', pharmacy: 'badge-danger' };

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/appointments')])
      .then(([uRes, aRes]) => {
        setUsers(uRes.data);
        setAppointments(aRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');

  return (
    <DashboardLayout>
      <div className="fade-in-up">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Dashboard 🛡️</h1>
          <p style={{ color: '#64748b' }}>System overview and management</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard icon={Users} label="Total Users" value={users.length} color="#3b82f6" />
          <StatCard icon={ShieldCheck} label="Patients" value={patients.length} color="#10b981" />
          <StatCard icon={Activity} label="Doctors" value={doctors.length} color="#8b5cf6" />
          <StatCard icon={Calendar} label="Appointments" value={appointments.length} color="#f59e0b" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['users', 'appointments'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: tab === t ? 'rgba(59,130,246,0.15)' : 'rgba(30,41,59,0.6)', color: tab === t ? '#60a5fa' : '#64748b', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {tab === 'users' && (
          <div className="stat-card">
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>All Users ({users.length})</h2>
            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Name', 'Email', 'Role', 'Specialization', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.875rem 0.75rem', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: 32, height: 32, background: 'rgba(59,130,246,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#60a5fa' }}>
                              {u.name?.charAt(0)}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', color: '#94a3b8' }}>{u.email}</td>
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <span className={`badge ${roleBadge[u.role] || 'badge-info'}`}>{u.role}</span>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', color: '#64748b' }}>{u.specialization || '—'}</td>
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <button onClick={() => deleteUser(u._id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '0.3rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Appointments Table */}
        {tab === 'appointments' && (
          <div className="stat-card">
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>All Appointments ({appointments.length})</h2>
            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Patient', 'Doctor', 'Date & Time', 'Type', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.875rem 0.75rem', fontWeight: 600 }}>{a.patient?.name}</td>
                        <td style={{ padding: '0.875rem 0.75rem', color: '#94a3b8' }}>Dr. {a.doctor?.name}</td>
                        <td style={{ padding: '0.875rem 0.75rem', color: '#94a3b8' }}>{new Date(a.date).toLocaleDateString()} at {a.time}</td>
                        <td style={{ padding: '0.875rem 0.75rem' }}><span className="badge badge-info">{a.type}</span></td>
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <span className={`badge ${a.status === 'confirmed' ? 'badge-success' : a.status === 'pending' ? 'badge-warning' : a.status === 'completed' ? 'badge-info' : 'badge-danger'}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
