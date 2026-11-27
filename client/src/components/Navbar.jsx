import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenReport }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4EF]/95 backdrop-blur-sm border-b border-[#E4DFD3]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-baseline gap-2 group">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C84B31] translate-y-[-1px] group-hover:scale-110 transition-transform" />
            <span className="font-display text-2xl font-bold tracking-tight text-[#18181B]">
              CivicPin
            </span>
            <span className="hidden sm:inline font-mono-code text-[11px] uppercase tracking-widest text-[#78716C] border-l border-[#D6D0C4] pl-2.5">
              Chennai Desk
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link
              to="/"
              className={`py-1 border-b-2 transition-colors ${
                isHome
                  ? 'border-[#18181B] text-[#18181B] font-semibold'
                  : 'border-transparent text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              Live Log
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`py-1 border-b-2 inline-flex items-center gap-1.5 transition-colors ${
                  isAdmin
                    ? 'border-[#C84B31] text-[#C84B31] font-semibold'
                    : 'border-transparent text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Dispatch Console
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 bg-[#C84B31] hover:bg-[#B03E26] text-[#FFFDF9] text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Pin an issue</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E4DFD3]">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-sm font-medium text-[#18181B]">{user.name}</div>
                <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#78716C]">
                  {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg text-[#78716C] hover:text-[#18181B] hover:bg-[#EAE5DA] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-medium text-[#18181B] hover:text-[#C84B31] px-3 py-2 rounded-lg border border-[#D6D0C4] hover:border-[#18181B] bg-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
