// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HomePage from './pages/Homepage';
import { AuthProvider } from './auth/AuthProvider';


function App() {
  return (
    <AuthProvider>
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
