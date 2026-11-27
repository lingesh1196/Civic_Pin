import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Plus, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenReport }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';
  const isAuth = location.pathname === '/auth';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E6E8EC]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#0B1220] text-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold tracking-tight text-[#0B1220]">CivicPin</span>
              <span className="hidden sm:inline text-[11px] font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                Chennai
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isHome
                  ? 'bg-[#F1F5F9] text-[#0B1220]'
                  : 'text-[#64748B] hover:text-[#0B1220] hover:bg-[#F8FAFC]'
              }`}
            >
              Issues
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
                isAdmin
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#64748B] hover:text-[#0B1220] hover:bg-[#F8FAFC]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin"
            className={`md:hidden px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isAdmin
                ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                : 'bg-white text-[#475569] border-[#E2E8F0]'
            }`}
          >
            Admin
          </Link>

          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 bg-[#0B1220] hover:bg-[#2563EB] text-white text-sm font-medium px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.25]" />
            <span>Report Issue</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2.5 border-l border-[#E6E8EC]">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs font-semibold text-[#0B1220]">{user.name}</div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                  {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-[#64748B] hover:text-[#0B1220] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                isAuth
                  ? 'bg-[#0B1220] text-white border-[#0B1220]'
                  : 'bg-white text-[#0B1220] border-[#E2E8F0] hover:border-[#94A3B8]'
              }`}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
