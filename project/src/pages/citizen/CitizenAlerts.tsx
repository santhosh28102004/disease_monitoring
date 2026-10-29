import { useEffect, useState } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { AlertDetailsModal } from '@/components/AlertDetailsModal';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

export function CitizenAlerts() {
  const { user } = useAuth();
  const { alerts } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedAlertId = (location.state as { selectedAlertId?: string } | null)?.selectedAlertId;
  const [detailAlertId, setDetailAlertId] = useState<string | null>(null);
  const userLocation = user?.location ?? '';

  useEffect(() => {
    if (!selectedAlertId) return;
    setDetailAlertId(selectedAlertId);
    navigate(location.pathname, { replace: true, state: null });
  }, [selectedAlertId, location.pathname, navigate]);

  const sorted = [...alerts].sort((a, b) => {
    if (a.location === userLocation && b.location !== userLocation) return -1;
    if (a.location !== userLocation && b.location === userLocation) return 1;
    return 0;
  });

  return (
    <AppShell>
      <PageHeader title="Alerts" breadcrumb="Alerts" />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-muted">No active alerts.</td>
                </tr>
              ) : sorted.map((a, i) => (
                <tr key={a.id} className={`border-b border-border last:border-0 hover:bg-slate-50 transition ${a.location === userLocation ? 'bg-primary-light/30' : ''}`}>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{i + 1}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-ink">{a.disease}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">
                    {a.location}
                    {a.location === userLocation && <span className="ml-2 text-xs text-primary font-medium">Your area</span>}
                  </td>
                  <td className="px-4 py-3.5"><Badge status={a.riskLevel} /></td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{a.cases}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted max-w-xs">{a.message}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5"><Badge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {detailAlertId && alerts.find((alert) => alert.id === detailAlertId) && (
        <AlertDetailsModal
          alert={alerts.find((alert) => alert.id === detailAlertId)!}
          onClose={() => setDetailAlertId(null)}
        />
      )}
    </AppShell>
  );
}
