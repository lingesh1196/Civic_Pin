import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let loggedIn;
      if (mode === 'login') {
        loggedIn = await login(email, password);
      } else {
        loggedIn = await register({ name, email, password, neighborhood });
      }
      navigate(loggedIn.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(demoEmail, demoPassword) {
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(demoEmail, demoPassword);
      navigate(loggedIn.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="premium-card rounded-3xl max-w-md w-full p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-11 h-11 rounded-2xl bg-[#0B1220] text-white flex items-center justify-center mx-auto shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1220]">
            {mode === 'login' ? 'Sign in to CivicPin' : 'Create your account'}
          </h1>
          <p className="text-sm text-[#64748B]">
            {mode === 'login'
              ? 'Report civic issues, upvote priorities, or open the admin dispatch console.'
              : 'Join your neighborhood to report and track local repairs.'}
          </p>
        </div>

        {/* One-click Demo Access */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('citizen@civicpin.org', 'citizen123')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] text-xs font-semibold text-[#0B1220] transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#2563EB]" />
            Demo Citizen
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('admin@civicpin.org', 'admin123')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] text-xs font-semibold text-[#0B1220] transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
            Demo Admin
          </button>
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-[#E6E8EC]" />
          <span className="px-3 text-xs text-[#94A3B8]">or continue with email</span>
          <div className="flex-grow border-t border-[#E6E8EC]" />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Karthik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Neighborhood</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g., Adyar, Anna Nagar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#0B1220] hover:bg-[#2563EB] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="text-center text-sm text-[#64748B]">
          {mode === 'login' ? (
            <>
              New to CivicPin?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
