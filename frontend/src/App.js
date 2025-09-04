// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HomePage from './pages/Homepage';
import { AuthProvider } from './auth/AuthProvider';
import InfoManagement from './pages/InfoManagement';
import ChatContainer from './components/Chat/ChatContainer';
import DoctorSearch from './components/relationships/DoctorSearch';
import PendingRequests from './components/relationships/PendingRequests';
import MyCollaborations from './components/relationships/MyCollaborations';
import BookAppointment from './pages/appointments/BookAppointment';
import ManageSlots from './pages/appointments/ManageSlots';
import AppointmentList from './pages/appointments/AppointmentList';
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={<Profile key={localStorage.getItem('token') || 'guest'} />}
          />
          <Route path="/infomanagement" element={<InfoManagement />} />
          <Route
            path="/chat"
            element={<ChatContainer key={localStorage.getItem('token') || 'guest'} />}
          />

          <Route path="/doctors/search" element={<DoctorSearch />} />
          <Route path="/collaborations/pending" element={<PendingRequests />} />
          <Route path="/collaborations" element={<MyCollaborations />} />

          <Route path="/appointments/book/:doctorId" element={<BookAppointment />} />
          <Route path="/manageslots" element={<ManageSlots />} />
          <Route path="/appointmentlist" element={<AppointmentList />} />
          <Route path="/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;