import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Customers from './pages/Customers';
import Promotions from './pages/Promotions';
import PromotionVehicles from './pages/PromotionVehicles';
import Reports from './pages/Reports';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
      <Route path="/promotion-vehicles" element={<ProtectedRoute><PromotionVehicles /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0' }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
