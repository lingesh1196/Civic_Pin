import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-serif-editorial text-3xl font-medium text-[#1C211E]">
          {mode === 'login' ? 'Sign in to CivicPin' : 'Create an account'}
        </h1>
        <p className="text-sm text-[#5C635E]">
          {mode === 'login'
            ? 'Report issues, upvote neighborhood priorities, or open the admin console.'
            : 'Register as a resident to file and follow local civic reports.'}
        </p>
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDemoLogin('citizen@civicpin.org', 'citizen123')}
          className="flex-1 py-2 px-3 rounded-md border border-[#DDD6CB] bg-white hover:border-[#1C211E] text-sm font-medium text-[#1C211E] cursor-pointer"
        >
          Demo Citizen
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDemoLogin('admin@civicpin.org', 'admin123')}
          className="flex-1 py-2 px-3 rounded-md border border-[#DDD6CB] bg-white hover:border-[#1C211E] text-sm font-medium text-[#1C211E] cursor-pointer"
        >
          Demo Admin
        </button>
      </div>

      <div className="border-t border-[#E3DDD3]" />

      {error && (
        <div className="p-3 rounded-md bg-[#FBECEC] border border-[#EAC6C6] text-sm text-[#8C2D2D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
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
            placeholder="you@example.com"
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
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

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
    </div>
  );
}
