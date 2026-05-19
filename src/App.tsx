import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ContractStoreSearch from './pages/ContractStoreSearch';
import AdminDashboard from './pages/AdminDashboard';
import BulkUpload from './pages/BulkUpload';
import MenuLayout from './pages/backend/MenuLayout';
import Login from './pages/backend/Login';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContractStoreSearch/>} />
        <Route path="/contract-store-search" element={<ContractStoreSearch/>} />
        <Route path="/management/index" element={<MenuLayout/>} />
        <Route path="/management/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;