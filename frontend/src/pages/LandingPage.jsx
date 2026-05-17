import { Link } from 'react-router-dom';
import { Activity, Shield, Clock, Users, ChevronRight, Heart, Brain, Stethoscope, Star } from 'lucide-react';

const features = [
  { icon: Activity, title: 'Real-Time Monitoring', desc: 'Live health data synced instantly across all devices and care teams.' },
  { icon: Shield, title: 'HIPAA-Grade Security', desc: 'End-to-end encrypted records with role-based access control.' },
  { icon: Brain, title: 'AI Diagnostics', desc: 'AI-assisted symptom analysis and personalized treatment suggestions.' },
  { icon: Clock, title: 'Smart Scheduling', desc: 'Automated appointment booking with real-time availability.' },
  { icon: Stethoscope, title: 'Video Consultations', desc: 'HD video calls with doctors from anywhere, any time.' },
  { icon: Heart, title: 'EHR Integration', desc: 'Unified electronic health records accessible by authorized providers.' },
];

const stats = [
  { value: '50K+', label: 'Patients Served' },
  { value: '1,200+', label: 'Verified Doctors' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'Average Rating' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Patient', text: 'CareSync transformed how I manage my health. Booking appointments takes seconds, and I have all my records in one place.', rating: 5 },
  { name: 'Dr. Michael Chen', role: 'Cardiologist', text: 'The AI diagnosis suggestions save me valuable time. My patient workflow has never been more efficient.', rating: 5 },
  { name: 'Emma Williams', role: 'Patient', text: 'The video consultation feature is incredible. I got expert care without leaving my home during recovery.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareSync</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.875rem' }}>Sign In</Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 999, padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#60a5fa', marginBottom: '2rem' }}>
          <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', display: 'inline-block' }} />
          AI-Powered Healthcare Platform — Now Live
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Healthcare That{' '}
          <span className="gradient-text">Moves With You</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 620, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          CareSync unifies patients, doctors, and pharmacies in one intelligent ecosystem — delivering real-time care at every step.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Start for Free <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Sign In as Doctor
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', maxWidth: 800, margin: '0 auto 6rem', padding: '0 2rem' }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto 6rem', padding: '0 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>A complete suite of tools built for modern healthcare delivery.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="stat-card card-hover" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1000, margin: '0 auto 6rem', padding: '0 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>Loved by Patients & Doctors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {testimonials.map((t) => (
            <div key={t.name} className="stat-card">
              <div style={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>"{t.text}"</p>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 6rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '1.5rem', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Transform Healthcare?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Join thousands of patients and doctors on CareSync today.</p>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem', textAlign: 'center', color: '#334155', fontSize: '0.875rem' }}>
        © 2026 CareSync. All rights reserved. Built with ❤️ for better healthcare.
      </footer>
    </div>
  );
}
