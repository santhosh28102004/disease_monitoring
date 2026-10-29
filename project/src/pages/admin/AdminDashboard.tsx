import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { getHealthMetrics } from '@/lib/healthMetrics';

export function AdminDashboard() {
  const { user } = useAuth();
  const { reports, reportsError, cases, casesError } = useData();
  const { stats, locations } = getHealthMetrics(reports, cases);
  const errors = [reportsError, casesError].filter(Boolean).join(' ');

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Welcome, {user?.name?.split(' ').slice(-1)[0]}</h1>
          <p className="mt-1 text-sm text-ink-muted">Overview of community health surveillance.</p>
        </div>
      </div>

      {errors && <p role="alert" className="mb-4 text-sm text-danger-text">{errors}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total Reports" value={stats.totalReports.toLocaleString()} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard icon={ShieldCheck} label="Verified Cases" value={stats.verifiedCases.toLocaleString()} iconBg="bg-success-bg" iconColor="text-success-icon" />
        <StatCard icon={Activity} label="Active Cases" value={stats.activeCases.toLocaleString()} iconBg="bg-warning-bg" iconColor="text-warning-icon" />
        <StatCard icon={CheckCircle2} label="Resolved Cases" value={stats.resolvedCases.toLocaleString()} iconBg="bg-success-bg" iconColor="text-success-icon" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Location Overview</h2>
          <Link to="/admin/locations" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            View All Locations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Total Reports</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Verified Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Active Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Resolved Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">{errors ? 'Unable to load location statistics.' : 'No reports have been submitted yet.'}</td></tr>
              ) : locations.map((l) => (
                <tr key={l.name} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5 text-sm font-medium text-ink">{l.name}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{l.totalReports}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{l.verifiedCases}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{l.activeCases}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{l.resolvedCases}</td>
                  <td className="px-4 py-3.5"><Badge status={l.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AppShell>
  );
}
