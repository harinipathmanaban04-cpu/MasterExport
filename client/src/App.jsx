import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Shipments from './pages/Shipments';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Navigate to="/" replace />} />
        <Route path="/sales" element={<Navigate to="/" replace />} />
        <Route path="/sales/quotations" element={<Navigate to="/" replace />} />
        <Route path="/quotations" element={<Navigate to="/" replace />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
