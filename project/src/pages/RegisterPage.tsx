import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

interface LocationOption {
  _id: string;
  area: string;
}

interface RegistrationResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    role: string;
  };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '', password: '', confirmPassword: '', terms: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<LocationOption[]>('/locations')
      .then(setLocations)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load locations.'));
  }, []);

  const update = (key: string, val: string | boolean) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.terms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest<RegistrationResponse>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      login({
        id: result.user.id,
        name: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        location: result.user.location,
        role: 'citizen',
        token: result.token,
      });
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.');
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
          <p className="mt-3 text-white/80">Join your community's health network</p>
          <svg viewBox="0 0 300 200" className="mt-8 w-full max-w-xs mx-auto" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="300" height="200" rx="16" fill="rgba(255,255,255,0.1)" />
            <rect x="20" y="100" width="40" height="70" rx="4" fill="rgba(255,255,255,0.2)" />
            <rect x="70" y="80" width="40" height="90" rx="4" fill="rgba(255,255,255,0.15)" />
            <rect x="190" y="90" width="40" height="80" rx="4" fill="rgba(255,255,255,0.2)" />
            <rect x="240" y="110" width="40" height="60" rx="4" fill="rgba(255,255,255,0.15)" />
            <rect x="0" y="170" width="300" height="30" fill="rgba(255,255,255,0.05)" />
            <g transform="translate(130, 30)">
              <rect x="0" y="0" width="36" height="36" rx="8" fill="#fff" />
              <rect x="14" y="7" width="8" height="22" rx="2" fill="#2563EB" />
              <rect x="7" y="14" width="22" height="8" rx="2" fill="#2563EB" />
            </g>
          </svg>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center bg-app-bg px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-ink">Create Account</h2>
            <p className="mt-2 text-sm text-ink-muted">Join your community's health network today.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Citizen" className="input" required />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" className="input" required />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className="input" required />
              </div>
              <div>
                <label className="label">Location</label>
                <select value={form.location} onChange={(e) => update('location', e.target.value)} className="input" required>
                  <option value="">Select your neighborhood</option>
                  {locations.map((location) => <option key={location._id} value={location._id}>{location.area}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Password</label>
                  <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" className="input" required />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••••" className="input" required />
                </div>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-ink-muted">I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a></span>
              </label>
              {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? 'Creating account...' : 'Create Account'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-ink-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
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
