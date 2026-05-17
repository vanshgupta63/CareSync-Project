import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  const getDashboard = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role === 'doctor') return <Navigate to="/doctor" />;
    if (user?.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/patient" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={getDashboard()} />

        <Route path="/patient" element={
          <ProtectedRoute roles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute roles={['patient', 'doctor']}>
            <AppointmentsPage />
          </ProtectedRoute>
        } />
        <Route path="/patient/records" element={
          <ProtectedRoute roles={['patient', 'doctor']}>
            <MedicalRecordsPage />
          </ProtectedRoute>
        } />

        <Route path="/doctor" element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute roles={['patient', 'doctor']}>
            <ChatPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
