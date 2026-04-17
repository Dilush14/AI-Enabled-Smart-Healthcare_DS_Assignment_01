import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Calendar, Users, FileText, Settings, Activity, PieChart } from 'lucide-react';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import VideoConsultation from './pages/patient/VideoConsultation';
import PatientReports from './pages/patient/PatientReports';
import PatientSettings from './pages/patient/PatientSettings';
import PatientCalendar from './pages/patient/PatientCalendar';
import PatientPayment from './pages/patient/PatientPayment';
import NotificationsPage from './pages/NotificationsPage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ManageSchedule from './pages/doctor/ManageSchedule';
import DoctorConsultation from './pages/doctor/DoctorConsultation';
import DoctorCalendar from './pages/doctor/DoctorCalendar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AnalyticsOverview from './pages/admin/AnalyticsOverview';

const patientLinks = [
  { name: 'Dashboard', path: '/patient/dashboard', icon: Home },
  { name: 'My Calendar', path: '/patient/calendar', icon: Calendar },
  { name: 'Find Doctors', path: '/patient/doctors', icon: Users },
  { name: 'My Reports', path: '/patient/reports', icon: FileText },
  { name: 'Settings', path: '/patient/settings', icon: Settings },
];

const doctorLinks = [
  { name: 'Dashboard', path: '/doctor/dashboard', icon: Home },
  { name: 'Calendar', path: '/doctor/calendar', icon: Calendar },
  { name: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
  { name: 'Settings', path: '/doctor/settings', icon: Settings },
];

const adminLinks = [
  { name: 'Overview', path: '/admin/dashboard', icon: Activity },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
];

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="doctors" element={<BrowseDoctors />} />
        </Route>

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardLayout role="Patient" links={patientLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="calendar" element={<PatientCalendar />} />
          <Route path="payments/:appointmentId" element={<PatientPayment />} />
          <Route path="doctors" element={<BrowseDoctors />} />
          <Route path="doctors/:id" element={<DoctorProfile />} />
          <Route path="book/:id" element={<BookAppointment />} />
          <Route path="consultation/:id" element={<VideoConsultation />} />
          <Route path="reports" element={<PatientReports />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>

        {/* Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardLayout role="Doctor" links={doctorLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="calendar" element={<DoctorCalendar />} />
          <Route path="schedule" element={<ManageSchedule />} />
          <Route path="consultation/:id" element={<DoctorConsultation />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="Admin" links={adminLinks} />
            </ProtectedRoute>
          }
        >
           <Route index element={<Navigate to="/admin/dashboard" replace />} />
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="users" element={<UserManagement />} />
           <Route path="analytics" element={<AnalyticsOverview />} />
            <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
