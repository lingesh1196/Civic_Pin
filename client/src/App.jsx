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
    <div className="min-h-screen flex flex-col bg-[#FCFAF7] text-[#1C211E]">
      <Navbar onOpenReport={handleOpenReport} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage refreshSignal={refreshSignal} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      <footer className="border-t border-[#E3DDD3] py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6D746F]">
          <span>CivicPin — Community civic issue reporting &amp; tracking.</span>
          <span>Built with MongoDB, Express, React &amp; Node.js</span>
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
