import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#141414] brutal-shadow max-w-md w-full p-8 space-y-6">
        <div className="space-y-2">
          <span className="inline-block bg-[#0F1E36] text-[#FFC700] font-mono-code text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
            DIGITAL COMPLAINT CELL · ACCESS
          </span>
          <h1 className="font-poster text-3xl uppercase text-[#141414]">
            {mode === 'login' ? 'SIGN IN TO CIVICPIN' : 'REGISTER CITIZEN ACCOUNT'}
          </h1>
          <p className="text-sm text-[#4A4A45]">
            {mode === 'login'
              ? 'File complaints, upvote ward priorities, or access the municipal dispatch ledger.'
              : 'Create an account to file and track neighborhood work orders.'}
          </p>
        </div>

        {/* One-click Demo Access */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('citizen@civicpin.org', 'citizen123')}
            className="brutal-btn brutal-shadow-sm flex items-center justify-center gap-2 p-2.5 border-2 border-[#141414] bg-[#FFC700] font-mono-code text-xs font-bold uppercase text-[#141414] cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            DEMO CITIZEN
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('admin@civicpin.org', 'admin123')}
            className="brutal-btn brutal-shadow-sm flex items-center justify-center gap-2 p-2.5 border-2 border-[#141414] bg-[#0F1E36] font-mono-code text-xs font-bold uppercase text-[#FFC700] cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            DEMO ADMIN
          </button>
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t-2 border-[#141414]/20" />
          <span className="px-3 font-mono-code text-[10px] font-bold uppercase tracking-widest text-[#5A5A52]">
            OR WITH EMAIL
          </span>
          <div className="flex-grow border-t-2 border-[#141414]/20" />
        </div>

        {error && (
          <div className="p-3 border-2 border-[#C92A2A] bg-[#C92A2A]/10 font-mono-code text-xs font-semibold text-[#C92A2A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase text-[#141414] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Karthik"
                  className="w-full px-3.5 py-2 border-2 border-[#141414] text-sm focus:outline-none focus:bg-[#FFFDF5]"
                />
              </div>
              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase text-[#141414] mb-1">
                  Ward / Neighborhood
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g., Adyar, Anna Nagar"
                  className="w-full px-3.5 py-2 border-2 border-[#141414] text-sm focus:outline-none focus:bg-[#FFFDF5]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-mono-code text-[11px] font-bold uppercase text-[#141414] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2 border-2 border-[#141414] text-sm focus:outline-none focus:bg-[#FFFDF5]"
            />
          </div>

          <div>
            <label className="block font-mono-code text-[11px] font-bold uppercase text-[#141414] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border-2 border-[#141414] text-sm focus:outline-none focus:bg-[#FFFDF5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="brutal-btn brutal-shadow-sm w-full py-2.5 bg-[#141414] text-[#FFC700] border-2 border-[#141414] font-mono-code text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            {loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
          </button>
        </form>

        <div className="text-center font-mono-code text-xs text-[#5A5A52]">
          {mode === 'login' ? (
            <>
              NEW HERE?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="font-bold text-[#C92A2A] hover:underline cursor-pointer uppercase"
              >
                CREATE AN ACCOUNT
              </button>
            </>
          ) : (
            <>
              ALREADY REGISTERED?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-bold text-[#C92A2A] hover:underline cursor-pointer uppercase"
              >
                SIGN IN
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
