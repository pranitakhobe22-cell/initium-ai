import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CameraCheck from './pages/CameraCheck';
import Interview from './pages/Interview';
import Summary from './pages/Summary';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/layout/Navbar';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('initium_user'));
  const token = localStorage.getItem('initium_token');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/profile'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRole="candidate">
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/camera-check" 
                element={
                  <ProtectedRoute allowedRole="candidate">
                    <CameraCheck />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/interview" 
                element={
                  <ProtectedRoute allowedRole="candidate">
                    <Interview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/summary" 
                element={
                  <ProtectedRoute allowedRole="candidate">
                    <Summary />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/" element={<Navigate to="/profile" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
