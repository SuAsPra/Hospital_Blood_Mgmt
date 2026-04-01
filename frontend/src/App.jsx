import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import ChatbotWidget from './components/ChatbotWidget.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import DoctorLogin from './pages/DoctorLogin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import Register from './pages/Register.jsx';
import Doctors from './pages/Doctors.jsx';
import Appointments from './pages/Appointments.jsx';
import Medicines from './pages/Medicines.jsx';
import BloodStock from './pages/BloodStock.jsx';
import Orders from './pages/Orders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PublicDashboard from './pages/PublicDashboard.jsx';

const App = () => {
  return (
    <div className="app-shell">
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/blood" element={<BloodStock />} />
          <Route path="/orders" element={<Orders />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowRoles={['admin']} redirectTo="/admin-login">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/staff" element={<Navigate to="/admin" replace />} />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowRoles={['public']}>
                <PublicDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default App;
