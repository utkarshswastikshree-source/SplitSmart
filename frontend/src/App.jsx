import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ScannerPage from './pages/ScannerPage';
import SplittingPage from './pages/SplittingPage';
import SettlementPage from './pages/SettlementPage';
import AiAssistantPage from './pages/AiAssistantPage';
import NotFoundPage from './pages/NotFoundPage';
import PayPalReturnPage from './pages/PayPalReturnPage';

function HomePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  if (params.has('token')) {
    return <PayPalReturnPage />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Shell */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/scan" element={<ScannerPage />} />
        <Route path="/split" element={<SplittingPage />} />
        <Route path="/settlement" element={<SettlementPage />} />
        <Route path="/assistant" element={<AiAssistantPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}