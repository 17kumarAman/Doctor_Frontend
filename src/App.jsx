import { useState } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import Navbar from './Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminAppointments from './pages/AdminAppointments';
import AdminDashboard from './pages/AdminDashBoard';
import BookAppointment from './pages/BookAppointment';
import Contact from './pages/Contact ';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorAvailability from './pages/DoctorAvailability';
import DoctorForm from './pages/DoctorForm';
import DoctorPage from './pages/DoctorPage';
import Enquiries from './pages/Enquiries';
import Login from './pages/Login';
import DoctorProfile from './pages/DoctorProfile';
import AdminProfile from './pages/AdminProfile';
import DoctorDashboard from './pages/DoctorDashboard';

function AppContent() {
  const { isAuthenticated, userType } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {isAuthenticated ? (
        <div className="flex h-[calc(100vh-64px)] max-w-[1720px] mx-auto">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-auto">
            <div className="p-4">
              <Routes>
                <Route path="/dashboard" element={
                  userType === 'admin' ? <AdminDashboard /> : <DoctorDashboard />
                } />
                <Route path="/enquiries" element={<Enquiries />} />
                <Route path="/doctors" element={<DoctorPage />} />
                <Route path="/doctors/create" element={<DoctorForm />} />
                <Route path="/doctors/edit/:id" element={<DoctorForm />} />
                <Route path="/appointments" element={
                  userType === 'admin' ? <AdminAppointments /> : <DoctorAppointments />
                } />
                <Route path="/availability" element={<DoctorAvailability />} />
                <Route path="/myprofile" element={
                  userType === 'admin' ? <AdminProfile /> : <DoctorProfile />
                } />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      ) : (
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/contact-us" replace />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/contact-us" replace />} />
          </Routes>
        </main>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
        closeButton
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
