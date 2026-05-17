import { useState, useEffect } from 'react';
import { FileText, Pill } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

export default function MedicalRecordsPage() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/records/mine').then(res => setRecords(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="fade-in-up">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Medical Records</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Your complete electronic health history</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading records...</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FileText size={56} style={{ margin: '0 auto 1.5rem', color: '#334155' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No records found</h3>
            <p style={{ color: '#64748b' }}>Your medical records will appear here after a consultation.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem' }}>
            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {records.map(rec => (
                <div key={rec._id} className={`stat-card card-hover`} onClick={() => setSelected(rec)}
                  style={{ cursor: 'pointer', border: `1px solid ${selected?._id === rec._id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`, background: selected?._id === rec._id ? 'rgba(59,130,246,0.07)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: 44, height: 44, background: 'rgba(59,130,246,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} color="#60a5fa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{rec.diagnosis || 'General Consultation'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>By Dr. {rec.doctor?.name} {rec.doctor?.specialization ? `• ${rec.doctor.specialization}` : ''}</div>
                      <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: 4 }}>{new Date(rec.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      {rec.prescription?.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: '#34d399', fontSize: '0.8rem' }}>
                          <Pill size={13} /> {rec.prescription.length} prescription{rec.prescription.length > 1 ? 's' : ''} issued
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Panel */}
            {selected && (
              <div className="stat-card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontWeight: 700 }}>Record Detail</h2>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Diagnosis</div>
                    <div style={{ fontWeight: 600 }}>{selected.diagnosis || 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Doctor</div>
                    <div>Dr. {selected.doctor?.name}</div>
                    {selected.doctor?.specialization && <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{selected.doctor.specialization}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Date</div>
                    <div>{new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  {selected.notes && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Notes</div>
                      <div style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.875rem' }}>{selected.notes}</div>
                    </div>
                  )}
                  {selected.prescription?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Prescriptions</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selected.prescription.map((p, i) => (
                          <div key={i} style={{ padding: '0.875rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                            <div style={{ fontWeight: 600, color: '#34d399', marginBottom: 4 }}>💊 {p.medicine}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Dosage: {p.dosage}</div>
                            {p.duration && <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Duration: {p.duration}</div>}
                            {p.instructions && <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Instructions: {p.instructions}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
