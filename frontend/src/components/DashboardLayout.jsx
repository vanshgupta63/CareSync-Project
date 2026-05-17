import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Calendar, FileText,
  MessageSquare, LogOut, Bell, ChevronRight, Menu, X
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import socket from '../lib/socket';

const patientLinks = [
  { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { to: '/patient/records', label: 'Medical Records', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
];

const doctorLinks = [
  { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { to: '/patient/records', label: 'Records', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'doctor' ? doctorLinks : user?.role === 'admin' ? adminLinks : patientLinks;

  const handleLogout = () => {
    socket.disconnect();
    logout();
    navigate('/login');
  };

  const roleColor = user?.role === 'doctor' ? '#10b981' : user?.role === 'admin' ? '#f59e0b' : '#3b82f6';
  const roleBg = user?.role === 'doctor' ? 'rgba(16,185,129,0.1)' : user?.role === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: 'rgba(15,23,42,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 40,
        transition: 'transform 0.3s ease',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareSync</span>
          </Link>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: 'white' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
              <div style={{ padding: '0.1rem 0.5rem', background: roleBg, color: roleColor, borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', display: 'inline-block', marginTop: 2 }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {label}
              {location.pathname === to && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', background: 'rgba(239,68,68,0.08)', color: '#f87171', border: 'none' }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ height: 64, background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 20 }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'none' }} className="mobile-menu-btn">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button style={{ position: 'relative', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.5rem', cursor: 'pointer', color: '#94a3b8' }}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #0f172a' }} />
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop { transform: translateX(0) !important; }
        }
        @media (max-width: 767px) {
          .sidebar-desktop { transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
          div[style*="margin-left: 260px"] { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
