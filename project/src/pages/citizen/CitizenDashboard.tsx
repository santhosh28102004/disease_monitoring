import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, Plus, Droplets, Sparkles, Bug, Stethoscope } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { healthTips } from '@/data/mockData';

const tipIcons: Record<string, typeof Droplets> = { Droplets, Sparkles, Bug, Stethoscope };

export function CitizenDashboard() {
  const { user } = useAuth();
  const { reports, reportsError, locationCases } = useData();
  const reportsById = new Map(
    locationCases.map((caseItem) => [caseItem.id, {
      id: caseItem.id,
      disease: caseItem.disease,
      location: user?.location ?? '',
      dateObserved: caseItem.dateObserved,
      status: caseItem.status,
    }]),
  );
  reports.forEach((report) => {
    reportsById.set(report.id, {
      id: report.id,
      disease: report.disease,
      location: report.location,
      dateObserved: report.dateObserved,
      status: report.status,
    });
  });
  const dashboardReports = [...reportsById.values()].sort(
    (first, second) => new Date(second.dateObserved).getTime() - new Date(first.dateObserved).getTime(),
  );
  const statuses = ['Submitted', 'Verified', 'Active', 'Acknowledged', 'Resolved'] as const;
  const statusCounts = statuses.map((status) => ({
    status,
    count: dashboardReports.filter((report) => report.status === status).length,
  }));
  const recent = dashboardReports.slice(0, 4);

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
        <StatCard icon={FileText} label="Reports in your location" value={dashboardReports.length} iconBg="bg-primary-light" iconColor="text-primary" />
        {statusCounts.map(({ status, count }) => (
          <StatCard
            key={status}
            icon={status === 'Resolved' || status === 'Verified' ? CheckCircle2 : Clock}
            label={status}
            value={count}
            iconBg={status === 'Active' ? 'bg-danger-bg' : status === 'Resolved' || status === 'Verified' ? 'bg-success-bg' : 'bg-warning-bg'}
            iconColor={status === 'Active' ? 'text-danger-icon' : status === 'Resolved' || status === 'Verified' ? 'text-success-icon' : 'text-warning-icon'}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink">Recent Reports in your location</h2>
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
