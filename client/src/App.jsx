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
    <div className="min-h-screen flex flex-col bg-[#F3F0E6] text-[#141414]">
      <Navbar onOpenReport={handleOpenReport} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<HomePage refreshSignal={refreshSignal} onOpenReport={handleOpenReport} />}
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      <footer className="border-t-2 border-[#141414] bg-[#F3F0E6] py-6 mt-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono-code text-xs text-[#5A5A52]">
          <span>
            <strong className="text-[#141414]">CIVICPIN</strong> — MUNICIPAL DIGITAL COMPLAINT CELL
          </span>
          <span>MERN STACK · PUBLIC LEDGER · TRANSPARENT DISPATCH</span>
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
