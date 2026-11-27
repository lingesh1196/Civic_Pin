import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ReportModal from './components/ReportModal';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  function handleOpenReport() {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowReportModal(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] text-[#0B1220]">
      <Navbar onOpenReport={handleOpenReport} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage refreshSignal={refreshSignal} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      <footer className="border-t border-[#E6E8EC] bg-white py-6 mt-12">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748B]">
          <span>
            <strong className="text-[#0B1220] font-semibold">CivicPin</strong> — Transparent civic issue reporting &amp; municipal resolution.
          </span>
          <span className="font-mono-code text-[11px] text-[#94A3B8]">MERN Stack · OpenStreetMap</span>
        </div>
      </footer>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onCreated={() => setRefreshSignal((n) => n + 1)}
        />
      )}
    </div>
  );
}
