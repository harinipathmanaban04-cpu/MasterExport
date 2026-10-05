import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Shipments from './pages/Shipments';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/enquiries" element={<Sales initialTab="Enquiries" />} />
        <Route path="/enquiry" element={<Sales initialTab="Enquiries" openNewEnquiry={true} />} />
        <Route path="/quotations" element={<Sales initialTab="Quotations" />} />
        <Route path="/sales/quotations" element={<Sales initialTab="Quotations" />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
