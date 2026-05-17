import { useState, useEffect } from 'react';
import { Calendar, FileText, MessageSquare, Heart, TrendingUp, Clock, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ width: 38, height: 38, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{sub}</div>}
  </div>
);

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, recRes] = await Promise.all([
          api.get('/appointments/mine'),
          api.get('/records/mine'),
        ]);
        setAppointments(apptRes.data);
        setRecords(recRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingAppts = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const completedAppts = appointments.filter(a => a.status === 'completed');

  const statusColor = { pending: '#fbbf24', confirmed: '#34d399', completed: '#60a5fa', cancelled: '#f87171' };
  const statusClass = { pending: 'badge-warning', confirmed: 'badge-success', completed: 'badge-info', cancelled: 'badge-danger' };

  return (
    <DashboardLayout>
      <div className="fade-in-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Here's a summary of your health today.</p>
          </div>
          <Link to="/patient/appointments" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} /> Book Appointment
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard icon={Calendar} label="Upcoming" value={upcomingAppts.length} color="#3b82f6" sub="appointments scheduled" />
          <StatCard icon={FileText} label="Records" value={records.length} color="#10b981" sub="medical records" />
          <StatCard icon={Heart} label="Completed" value={completedAppts.length} color="#f43f5e" sub="consultations done" />
          <StatCard icon={TrendingUp} label="Health Score" value="92%" color="#f59e0b" sub="based on recent activity" />
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Upcoming Appointments */}
          <div className="stat-card" style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Upcoming Appointments</h2>
              <Link to="/patient/appointments" style={{ color: '#60a5fa', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : upcomingAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>No upcoming appointments</p>
                <Link to="/patient/appointments" className="btn-primary" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-flex', fontSize: '0.8rem' }}>
                  Book Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingAppts.slice(0, 4).map(appt => (
                  <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 38, height: 38, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                      {appt.doctor?.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Dr. {appt.doctor?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {new Date(appt.date).toLocaleDateString()} at {appt.time}
                      </div>
                    </div>
                    <span className={`badge ${statusClass[appt.status]}`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Records */}
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Medical Records</h2>
              <Link to="/patient/records" style={{ color: '#60a5fa', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>No medical records yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {records.slice(0, 4).map(rec => (
                  <div key={rec._id} style={{ padding: '0.875rem', background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{rec.diagnosis || 'General Checkup'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>By Dr. {rec.doctor?.name} • {new Date(rec.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Symptom Checker */}
          <div className="stat-card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🤖 AI Symptom Checker</h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Describe your symptoms and get instant AI-powered insights before your next appointment.
                </p>
              </div>
              <Link to="/chat" className="btn-primary" style={{ textDecoration: 'none' }}>
                <MessageSquare size={16} /> Start Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
