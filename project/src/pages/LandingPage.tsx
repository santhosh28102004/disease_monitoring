import { ShieldCheck, Activity, MapPin, Bell, ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { landingStats } from '@/data/mockData';

const features = [
  { icon: Activity, title: 'Report in Seconds', desc: 'Quick symptom reporting from your phone' },
  { icon: ShieldCheck, title: 'Real-Time Verification', desc: 'Health officials verify reports fast' },
  { icon: MapPin, title: 'Live Risk Mapping', desc: 'Location-based risk levels at a glance' },
  { icon: Bell, title: 'Instant Community Alerts', desc: 'Get notified of outbreaks near you' },
];

const steps = [
  { num: '1', title: 'Report', desc: 'Citizens report symptoms and health issues in seconds through a simple form.' },
  { num: '2', title: 'Verify', desc: 'Health officials review and verify reports, adding clinical notes and follow-ups.' },
  { num: '3', title: 'Alert', desc: 'Verified cases trigger community alerts so everyone stays informed and safe.' },
];

export function LandingPage() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-ink">Health Surveillance</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-ink-muted hover:text-ink transition">Features</a>
            <a href="#how" className="text-sm font-medium text-ink-muted hover:text-ink transition">How it Works</a>
            <a href="#contact" className="text-sm font-medium text-ink-muted hover:text-ink transition">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
          <button onClick={() => setMobileNav((v) => !v)} className="md:hidden">
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-border px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileNav(false)} className="block text-sm font-medium text-ink-muted">Features</a>
            <a href="#how" onClick={() => setMobileNav(false)} className="block text-sm font-medium text-ink-muted">How it Works</a>
            <a href="#contact" onClick={() => setMobileNav(false)} className="block text-sm font-medium text-ink-muted">Contact</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-sm">Login</Link>
              <Link to="/register" className="btn-primary flex-1 text-sm">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink leading-[1.1] tracking-tight">
              Catch outbreaks before they spread.
            </h1>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-md">
              A community-powered, real-time disease reporting platform. Report symptoms, track verified cases, and get instant alerts about outbreaks in your neighborhood.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary text-base px-6 py-3">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3">
                I already have an account
              </Link>
            </div>
            <p className="mt-5 text-sm text-ink-muted">
              Used across 8 neighborhoods · 2,400+ verified reports
            </p>
          </div>
          <div className="relative">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section id="features" className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-card-hover transition group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary group-hover:scale-110 transition">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-sidebar-bg py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {landingStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1.5 text-sm text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-ink">How it Works</h2>
          <p className="mt-3 text-ink-muted">Three simple steps from report to community safety</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              <div className="card p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
                  {s.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-8 py-12 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Join the fight against outbreaks.</h2>
          <p className="mt-4 text-white/80 max-w-lg mx-auto">
            Create a free account and start reporting health issues in your community today.
          </p>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary hover:bg-white/90 transition">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-ink">Health Surveillance</span>
              </div>
              <p className="mt-3 text-sm text-ink-muted">Together for a healthier community.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How it Works', 'Alerts', 'Analytics'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-ink">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-ink-muted hover:text-ink transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-sm text-ink-muted">© 2026 Health Surveillance System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Background neighborhood */}
      <rect x="0" y="0" width="500" height="400" rx="24" fill="#EFF6FF" />
      <circle cx="420" cy="60" r="40" fill="#DBEAFE" />
      <circle cx="80" cy="50" r="30" fill="#DBEAFE" />

      {/* Buildings */}
      <rect x="30" y="180" width="60" height="120" rx="6" fill="#BFDBFE" />
      <rect x="100" y="150" width="50" height="150" rx="6" fill="#93C5FD" />
      <rect x="160" y="200" width="55" height="100" rx="6" fill="#BFDBFE" />
      <rect x="350" y="170" width="55" height="130" rx="6" fill="#93C5FD" />
      <rect x="415" y="200" width="55" height="100" rx="6" fill="#BFDBFE" />

      {/* Building windows */}
      {[185, 205, 225, 245, 265, 285].map((y) => (
        <g key={y}>
          <rect x="40" y={y} width="8" height="8" rx="1" fill="#60A5FA" opacity="0.5" />
          <rect x="55" y={y} width="8" height="8" rx="1" fill="#60A5FA" opacity="0.5" />
          <rect x="70" y={y} width="8" height="8" rx="1" fill="#60A5FA" opacity="0.5" />
        </g>
      ))}
      {[155, 175, 195, 215, 235, 255, 275].map((y) => (
        <g key={y}>
          <rect x="110" y={y} width="8" height="8" rx="1" fill="#3B82F6" opacity="0.4" />
          <rect x="125" y={y} width="8" height="8" rx="1" fill="#3B82F6" opacity="0.4" />
        </g>
      ))}

      {/* Ground */}
      <rect x="0" y="300" width="500" height="100" rx="0" fill="#DBEAFE" />
      <rect x="0" y="300" width="500" height="4" fill="#93C5FD" />

      {/* Doctor (left) */}
      <g transform="translate(140, 220)">
        <rect x="0" y="20" width="40" height="60" rx="8" fill="#2563EB" />
        <circle cx="20" cy="10" r="14" fill="#FBBF24" />
        <rect x="10" y="14" width="20" height="6" rx="3" fill="#fff" />
        <rect x="14" y="0" width="12" height="8" rx="2" fill="#fff" />
        <rect x="16" y="-2" width="8" height="6" rx="1" fill="#EF4444" />
        <line x1="20" y1="-2" x2="20" y2="4" stroke="#fff" strokeWidth="1.5" />
        <circle cx="20" cy="50" r="6" fill="#fff" opacity="0.3" />
      </g>

      {/* Parent (center) */}
      <g transform="translate(210, 230)">
        <rect x="0" y="20" width="36" height="50" rx="8" fill="#22C55E" />
        <circle cx="18" cy="10" r="13" fill="#FBBF24" />
        <path d="M5 8 Q18 0 31 8" stroke="#7C2D12" strokeWidth="2" fill="none" />
      </g>

      {/* Child (center-right) */}
      <g transform="translate(265, 250)">
        <rect x="0" y="15" width="28" height="35" rx="6" fill="#F97316" />
        <circle cx="14" cy="8" r="10" fill="#FBBF24" />
        <path d="M5 6 Q14 0 23 6" stroke="#1E293B" strokeWidth="1.5" fill="none" />
      </g>

      {/* Elderly person (right) */}
      <g transform="translate(310, 225)">
        <rect x="0" y="20" width="38" height="55" rx="8" fill="#A855F7" />
        <circle cx="19" cy="10" r="13" fill="#FBBF24" />
        <path d="M6 6 Q19 -2 32 6" stroke="#E2E8F0" strokeWidth="2" fill="none" />
        <circle cx="19" cy="10" r="13" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
      </g>

      {/* Health cross floating */}
      <g transform="translate(230, 100)">
        <rect x="0" y="0" width="40" height="40" rx="10" fill="#2563EB" />
        <rect x="16" y="8" width="8" height="24" rx="2" fill="#fff" />
        <rect x="8" y="16" width="24" height="8" rx="2" fill="#fff" />
      </g>

      {/* Small floating dots */}
      <circle cx="60" cy="120" r="6" fill="#22C55E" opacity="0.6" />
      <circle cx="440" cy="130" r="8" fill="#F97316" opacity="0.5" />
      <circle cx="380" cy="80" r="5" fill="#A855F7" opacity="0.5" />
    </svg>
  );
}
