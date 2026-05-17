import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import socket from '../lib/socket';

const statusClass = { pending: 'badge-warning', confirmed: 'badge-success', completed: 'badge-info', cancelled: 'badge-danger' };

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', type: 'in-person', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [apptRes] = await Promise.all([api.get('/appointments/mine')]);
      setAppointments(apptRes.data);
      if (user?.role === 'patient') {
        const docRes = await api.get('/users/doctors');
        setDoctors(docRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('appointment:new', fetchData);
    return () => socket.off('appointment:new', fetchData);
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/appointments', form);
      setAppointments(prev => [data, ...prev]);
      socket.emit('appointment:booked', { doctorId: form.doctorId, appointment: data });
      setShowModal(false);
      setForm({ doctorId: '', date: '', time: '', type: 'in-person', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}/status`, { status });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  return (
    <DashboardLayout>
      <div className="fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Appointments</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your scheduled consultations</p>
          </div>
          {user?.role === 'patient' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Book Appointment
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Calendar size={56} style={{ margin: '0 auto 1.5rem', color: '#334155' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No appointments found</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Book your first appointment to get started.</p>
            {user?.role === 'patient' && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Book Now</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {appointments.map(appt => (
              <div key={appt._id} className="stat-card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#60a5fa', flexShrink: 0 }}>
                  {(user?.role === 'patient' ? appt.doctor?.name : appt.patient?.name)?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                    {user?.role === 'patient' ? `Dr. ${appt.doctor?.name}` : appt.patient?.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />{new Date(appt.date).toLocaleDateString()}</span>
                    <span><Clock size={13} style={{ display: 'inline', marginRight: 4 }} />{appt.time}</span>
                    <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(59,130,246,0.1)', borderRadius: 6, fontSize: '0.78rem', color: '#60a5fa' }}>{appt.type}</span>
                  </div>
                  {appt.reason && <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>Reason: {appt.reason}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={`badge ${statusClass[appt.status]}`}>{appt.status}</span>
                  {user?.role === 'doctor' && appt.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => updateStatus(appt._id, 'confirmed')} style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, cursor: 'pointer' }}>Confirm</button>
                      <button onClick={() => updateStatus(appt._id, 'cancelled')} style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  )}
                  {user?.role === 'doctor' && appt.status === 'confirmed' && (
                    <button onClick={() => updateStatus(appt._id, 'completed')} style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, cursor: 'pointer' }}>Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Book Appointment Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass" style={{ width: '100%', maxWidth: 480, borderRadius: '1.25rem', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700 }}>Book Appointment</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={22} /></button>
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Doctor</label>
                  <select className="input-field" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} required style={{ background: 'rgba(15,23,42,0.8)' }}>
                    <option value="">Choose a doctor...</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name} {d.specialization ? `— ${d.specialization}` : ''}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                    <input className="input-field" type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</label>
                    <input className="input-field" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ background: 'rgba(15,23,42,0.8)' }}>
                    <option value="in-person">In-Person</option>
                    <option value="video">Video Call</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason (optional)</label>
                  <textarea className="input-field" rows={3} placeholder="Describe your symptoms or reason..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <button className="btn-primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
