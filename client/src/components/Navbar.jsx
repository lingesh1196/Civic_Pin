import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenReport }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';

  return (
    <header className="bg-[#FCFAF7] border-b border-[#E3DDD3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-serif-editorial text-2xl font-semibold tracking-tight text-[#1C211E]">
            CivicPin<span className="text-[#B84A27]">.</span>
          </Link>

          <nav className="flex items-center gap-5 text-[15px]">
            <Link
              to="/"
              className={`transition-colors ${
                isHome ? 'text-[#1C211E] font-semibold underline underline-offset-4 decoration-[#B84A27]' : 'text-[#5C635E] hover:text-[#1C211E]'
              }`}
            >
              Reports
            </Link>
            <Link
              to="/admin"
              className={`transition-colors ${
                isAdmin ? 'text-[#1C211E] font-semibold underline underline-offset-4 decoration-[#B84A27]' : 'text-[#5C635E] hover:text-[#1C211E]'
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-[14px]">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[#5C635E]">
                {user.name} <span className="text-xs text-[#8A918C]">({user.role})</span>
              </span>
              <button
                onClick={logout}
                className="text-[#5C635E] hover:text-[#1C211E] underline underline-offset-2 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="text-[#5C635E] hover:text-[#1C211E] font-medium">
              Sign in
            </Link>
          )}

          <button
            onClick={onOpenReport}
            className="bg-[#1C211E] hover:bg-[#B84A27] text-[#FCFAF7] font-medium px-4 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Report an issue
          </button>
        </div>
      </div>
    </header>
  );
}
