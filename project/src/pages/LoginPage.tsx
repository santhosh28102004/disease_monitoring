import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import type { AccountRole } from '@/data/mockData';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    role: AccountRole;
  };
}

const toAppRole = (role: AccountRole): 'citizen' | 'official' =>
  role === 'CITIZEN' ? 'citizen' : 'official';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const role = toAppRole(result.user.role);
      login({
        id: result.user.id,
        name: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        location: result.user.location,
        role,
        accountRole: result.user.role,
        token: result.token,
      });
      navigate(role === 'official' ? '/admin/dashboard' : '/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-primary to-primary-dark flex-col justify-center items-center px-12 relative overflow-hidden">
        <div className="absolute top-20 left-20 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative z-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
            <ShieldCheck className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">Health Surveillance System</h1>
          <p className="mt-3 text-white/80">Together for a healthier community</p>
          <LoginIllustration />
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center bg-app-bg px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-ink">Login</h2>
            <p className="mt-2 text-sm text-ink-muted">Welcome back! Please login to your account.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pr-10" required />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <a href="#" className="text-sm text-primary hover:underline">Forgot Password?</a>
                </div>
              </div>
              {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? 'Logging in...' : 'Login'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-ink-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link to="/" className="text-ink-muted hover:text-ink">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginIllustration() {
  return (
    <svg viewBox="0 0 300 200" className="mt-8 w-full max-w-xs mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="300" height="200" rx="16" fill="rgba(255,255,255,0.1)" />
      <rect x="20" y="100" width="40" height="70" rx="4" fill="rgba(255,255,255,0.2)" />
      <rect x="70" y="80" width="40" height="90" rx="4" fill="rgba(255,255,255,0.15)" />
      <rect x="190" y="90" width="40" height="80" rx="4" fill="rgba(255,255,255,0.2)" />
      <rect x="240" y="110" width="40" height="60" rx="4" fill="rgba(255,255,255,0.15)" />
      <rect x="0" y="170" width="300" height="30" fill="rgba(255,255,255,0.05)" />

      {/* People */}
      <g transform="translate(120, 100)">
        <rect x="0" y="20" width="30" height="45" rx="6" fill="#fff" opacity="0.9" />
        <circle cx="15" cy="10" r="11" fill="#FBBF24" />
      </g>
      <g transform="translate(160, 110)">
        <rect x="0" y="15" width="25" height="35" rx="5" fill="#fff" opacity="0.7" />
        <circle cx="12" cy="8" r="9" fill="#FBBF24" />
      </g>

      {/* Health cross */}
      <g transform="translate(130, 30)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#fff" />
        <rect x="14" y="7" width="8" height="22" rx="2" fill="#2563EB" />
        <rect x="7" y="14" width="22" height="8" rx="2" fill="#2563EB" />
      </g>
    </svg>
  );
}
