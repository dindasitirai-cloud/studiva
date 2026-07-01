import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { UserRole } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const [role, setRole] = useState<UserRole>('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    let user;
    try {
      user = await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal masuk. Periksa email dan password Anda.');
      setSubmitting(false);
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (user.role === 'teacher') {
      navigate('/guru');
      setSubmitting(false);
      return;
    }

    // Parent: check subscription tier to decide which dashboard to show
    try {
      const { data } = await api.get('/subscriptions/check');
      if (data.hasSubscription) {
        const dest = data.tier === 'tier2' ? '/dashboard/tier2' : data.tier === 'tier1' ? '/dashboard/tier1' : '/dashboard/parent';
        navigate(dest);
      } else {
        navigate('/pricing', { state: { message: 'Complete your subscription to access dashboard.' } });
      }
    } catch {
      navigate('/dashboard/parent');
    } finally {
      setSubmitting(false);
    }
  }

  const roleColor = role === 'teacher' ? 'bg-success hover:bg-success/90' : 'bg-gold hover:bg-gold/90';

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-bordergray bg-white p-8 shadow-sm">
        <h1 className="text-h2 font-bold text-navy">Masuk ke Studiva</h1>

        {successMessage && (
          <p className="mt-4 rounded-md bg-success/10 p-3 text-sm text-success">{successMessage}</p>
        )}

        <div className="mt-6 flex rounded-md border border-bordergray p-1">
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`min-h-[48px] flex-1 rounded-md text-sm font-medium transition ${
              role === 'parent' ? 'bg-navy text-white' : 'text-textdark'
            }`}
          >
            Sign in as Parent
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`min-h-[48px] flex-1 rounded-md text-sm font-medium transition ${
              role === 'teacher' ? 'bg-navy text-white' : 'text-textdark'
            }`}
          >
            Sign in as Teacher
          </button>
        </div>

        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-textdark">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-textdark">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`min-h-[48px] rounded-md px-6 py-3 font-semibold text-navy transition disabled:opacity-60 ${roleColor}`}
          >
            {submitting ? 'Memproses...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-textlight">
          Belum punya akun?{' '}
          <Link to="/signup" className="font-medium text-gold hover:underline">
            Sign up here
          </Link>
        </p>

        <div className="mt-6 rounded-md bg-background p-4 text-xs text-textlight">
          <p className="font-semibold text-textdark">Test credentials:</p>
          <p>Parent: test@studiva.id / password123</p>
          <p>Teacher: teacher@studiva.id / password123</p>
        </div>
      </div>
    </div>
  );
}
