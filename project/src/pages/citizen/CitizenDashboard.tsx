import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Droplets, Sparkles, Bug, Stethoscope } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { healthTips } from '@/data/mockData';

const tipIcons: Record<string, typeof Droplets> = { Droplets, Sparkles, Bug, Stethoscope };

export function CitizenDashboard() {
  const { user } = useAuth();
  const { reports, reportsError } = useData();
  const myReports = reports.filter((r) => r.reportedBy === user?.name);
  const pending = myReports.filter((r) => r.status === 'Pending').length;
  const verified = myReports.filter((r) => r.status === 'Verified').length;
  const rejected = myReports.filter((r) => r.status === 'Rejected').length;
  const recent = [...myReports].slice(0, 4);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="mt-1 text-sm text-ink-muted">Here's what's happening with your reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-white border border-border px-3 py-2 text-sm text-ink-muted">{today}</span>
          <Link to="/report" className="btn-primary">
            <Plus className="h-4 w-4" /> Report Health Issue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="My Reports" value={myReports.length} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard icon={Clock} label="Pending" value={pending} iconBg="bg-warning-bg" iconColor="text-warning-icon" />
        <StatCard icon={CheckCircle2} label="Verified" value={verified} iconBg="bg-success-bg" iconColor="text-success-icon" />
        <StatCard icon={XCircle} label="Rejected" value={rejected} iconBg="bg-danger-bg" iconColor="text-danger-icon" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink">Recent Reports</h2>
            <Link to="/my-reports" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {reportsError && <p role="alert" className="text-sm text-danger-text">{reportsError}</p>}
            {recent.length === 0 ? (
              <p className="text-sm text-ink-muted py-8 text-center">No reports yet. Submit your first health report!</p>
            ) : (
              recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{r.disease}</p>
                    <p className="text-xs text-ink-muted">Area: {r.location} · {new Date(r.dateObserved).toLocaleDateString()}</p>
                  </div>
                  <Badge status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Health Tips</h2>
          <div className="space-y-3">
            {healthTips.map((tip) => {
              const Icon = tipIcons[tip.icon] ?? Droplets;
              return (
                <div key={tip.text} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                    <Icon className={`h-5 w-5 ${tip.color}`} />
                  </div>
                  <p className="text-sm text-ink">{tip.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
