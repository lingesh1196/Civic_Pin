import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState('citizen'); // 'citizen' | 'admin'
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
      if (mode === 'login' || roleTab === 'admin') {
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
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-serif-editorial text-3xl font-medium text-[#1C211E]">
          {roleTab === 'admin'
            ? 'Admin sign in'
            : mode === 'login'
              ? 'Citizen sign in'
              : 'Create a citizen account'}
        </h1>
        <p className="text-sm text-[#5C635E]">
          {roleTab === 'admin'
            ? 'Sign in with a municipal admin account to manage and resolve civic reports.'
            : 'Report issues, upvote neighborhood priorities, and post updates.'}
        </p>
      </div>

      {/* Role Switcher: Citizen Login vs Admin Login */}
      <div className="grid grid-cols-2 border border-[#DDD6CB] rounded-md overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => {
            setRoleTab('citizen');
            setError('');
          }}
          className={`py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            roleTab === 'citizen'
              ? 'bg-[#1C211E] text-white'
              : 'text-[#5C635E] hover:text-[#1C211E]'
          }`}
        >
          User / Citizen Login
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleTab('admin');
            setMode('login');
            setError('');
          }}
          className={`py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            roleTab === 'admin'
              ? 'bg-[#1C211E] text-white'
              : 'text-[#5C635E] hover:text-[#1C211E]'
          }`}
        >
          Admin Login
        </button>
      </div>

      {/* Quick One-Click Demo Login */}
      <div className="p-3.5 rounded-md bg-[#F4EFE7] border border-[#E3DDD3] flex items-center justify-between gap-3">
        <div className="text-xs text-[#4E5550]">
          {roleTab === 'admin' ? (
            <>
              <div className="font-semibold text-[#1C211E]">Demo Admin</div>
              <div>admin@civicpin.org · admin123</div>
            </>
          ) : (
            <>
              <div className="font-semibold text-[#1C211E]">Demo Citizen</div>
              <div>citizen@civicpin.org · citizen123</div>
            </>
          )}
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            roleTab === 'admin'
              ? handleDemoLogin('admin@civicpin.org', 'admin123')
              : handleDemoLogin('citizen@civicpin.org', 'citizen123')
          }
          className="px-3 py-1.5 rounded bg-[#B84A27] hover:bg-[#993B1D] text-white text-xs font-medium cursor-pointer whitespace-nowrap"
        >
          One-click sign in
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-[#FBECEC] border border-[#EAC6C6] text-sm text-[#8C2D2D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {roleTab === 'citizen' && mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#1C211E] mb-1">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Karthik"
                className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD6CB] text-sm focus:outline-none focus:border-[#1C211E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C211E] mb-1">Neighborhood</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g., Adyar, Anna Nagar"
                className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD6CB] text-sm focus:outline-none focus:border-[#1C211E]"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-[#1C211E] mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={roleTab === 'admin' ? 'admin@civicpin.org' : 'you@example.com'}
            className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD6CB] text-sm focus:outline-none focus:border-[#1C211E]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1C211E] mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD6CB] text-sm focus:outline-none focus:border-[#1C211E]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-md bg-[#1C211E] hover:bg-[#B84A27] disabled:opacity-60 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          {loading
            ? 'Please wait...'
            : roleTab === 'admin'
              ? 'Sign in as Admin'
              : mode === 'login'
                ? 'Sign in as Citizen'
                : 'Create account'}
        </button>
      </form>

      {roleTab === 'citizen' && (
        <div className="text-sm text-[#5C635E]">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="font-medium text-[#B84A27] hover:underline cursor-pointer"
              >
                Sign up
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
                className="font-medium text-[#B84A27] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
