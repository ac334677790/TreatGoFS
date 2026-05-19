import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ContractStoreSearch from './pages/ContractStoreSearch';
import AdminDashboard from './pages/AdminDashboard';
import BulkUpload from './pages/BulkUpload';
import MenuLayout from './pages/backend/MenuLayout';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContractStoreSearch/>} />
        <Route path="/contract-store-search" element={<ContractStoreSearch/>} />
        <Route path="/admin" element={<AdminDashboard/>} />
        <Route path="/management/index" element={<MenuLayout/>} />
        <Route path="/admin/upload" element={<BulkUpload/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;