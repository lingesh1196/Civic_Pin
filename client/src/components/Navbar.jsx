import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenReport }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';
  const isAuth = location.pathname === '/auth';

  return (
    <header className="sticky top-0 z-40 bg-[#F3F0E6] border-b-2 border-[#141414]">
      {/* Top Roadwork Hazard Stripe */}
      <div className="hazard-stripe w-full" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <svg
            width="22"
            height="28"
            viewBox="0 0 24 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M12 0C5.37 0 0 5.37 0 12C0 20.25 12 30 12 30C12 30 24 20.25 24 12C24 5.37 18.63 0 12 0Z"
              fill="#141414"
            />
            <circle cx="12" cy="11.5" r="4.5" fill="#FFC700" />
          </svg>
          <span className="font-poster text-2xl sm:text-[26px] tracking-wide leading-none">
            <span className="text-[#141414]">CIVIC</span>
            <span className="text-[#C92A2A]">PIN</span>
          </span>
        </Link>

        {/* Center Monospace Nav */}
        <nav className="hidden md:flex items-center gap-2 font-mono-code text-xs uppercase tracking-widest">
          <Link
            to="/"
            className={`px-3.5 py-2 font-semibold transition-colors ${
              isHome
                ? 'bg-[#141414] text-[#F3F0E6]'
                : 'text-[#141414] hover:bg-[#E5E0D0]'
            }`}
          >
            LEDGER
          </Link>
          <button
            type="button"
            onClick={onOpenReport}
            className="px-3.5 py-2 font-semibold text-[#141414] hover:bg-[#E5E0D0] transition-colors cursor-pointer uppercase"
          >
            REPORT
          </button>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 font-semibold transition-colors ${
                isAdmin
                  ? 'bg-[#141414] text-[#F3F0E6]'
                  : 'text-[#141414] hover:bg-[#E5E0D0]'
              }`}
            >
              ADMIN
            </Link>
          )}
          {!user && (
            <Link
              to="/auth"
              className={`px-3.5 py-2 font-semibold transition-colors ${
                isAuth
                  ? 'bg-[#141414] text-[#F3F0E6]'
                  : 'text-[#141414] hover:bg-[#E5E0D0]'
              }`}
            >
              SIGN IN
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 pr-1">
              <div className="text-right leading-tight">
                <div className="font-mono-code text-xs font-bold text-[#141414] uppercase">
                  {user.name.split(' ')[0]}
                </div>
                <div className="font-mono-code text-[10px] uppercase text-[#5A5A52]">
                  {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 border-2 border-[#141414] bg-white hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={onOpenReport}
            className="brutal-btn brutal-shadow-sm bg-[#FFC700] text-[#141414] border-2 border-[#141414] font-mono-code text-xs font-bold uppercase tracking-wider px-4 py-2.5 cursor-pointer whitespace-nowrap"
          >
            + FILE A COMPLAINT
          </button>
        </div>
      </div>
    </header>
  );
}
