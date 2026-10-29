import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export function CitizenAlerts() {
  const { user } = useAuth();
  const { reports, locationCases, locationCasesError, locationCasesLoading } = useData();
  const userLocation = user?.location ?? '';
  const locationKey = userLocation.trim().toLocaleLowerCase();
  const casesById = new Map(locationCases.map((caseItem) => [caseItem.id, caseItem]));

  reports
    .filter((report) => report.location.trim().toLocaleLowerCase() === locationKey)
    .forEach((report) => {
      if (!casesById.has(report.id)) {
        casesById.set(report.id, {
          id: report.id,
          disease: report.disease,
          symptoms: report.symptoms.split(',').map((symptom) => symptom.trim()).filter(Boolean),
          affectedPeople: report.affectedPeople,
          severity: report.severity,
          status: report.status,
          dateObserved: report.dateObserved,
        });
      }
    });
  const visibleCases = [...casesById.values()].sort(
    (first, second) => new Date(second.dateObserved).getTime() - new Date(first.dateObserved).getTime(),
  );

  return (
    <AppShell>
      <PageHeader title="Alerts" breadcrumb="Alerts" />
      <section className="card mb-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-ink">Alerts in your location</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {userLocation ? `All users’ cases and their current status for ${userLocation}.` : 'Add your location by logging in as a user to see cases in your area.'}
          </p>
        </div>
        {locationCasesError && <p role="alert" className="p-5 text-sm text-danger-text">{locationCasesError}</p>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Symptoms</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Affected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Date observed</th>
              </tr>
            </thead>
            <tbody>
              {locationCasesLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-muted">Loading cases for your location...</td></tr>
              ) : visibleCases.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-muted">No cases found for this location.</td></tr>
              ) : visibleCases.map((caseItem) => (
                <tr key={caseItem.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3.5 text-sm font-medium text-ink">{caseItem.disease}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{caseItem.symptoms.join(', ') || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{caseItem.affectedPeople}</td>
                  <td className="px-4 py-3.5"><Badge status={caseItem.status} /></td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{new Date(caseItem.dateObserved).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
