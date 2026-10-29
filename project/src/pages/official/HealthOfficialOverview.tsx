import { useEffect, useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import type { Report } from '@/data/mockData';
import { useToast } from '@/components/Toast';
import { apiRequest } from '@/lib/api';

interface RegistrationOverview {
  registeredUserCount: number;
  users: { id: string; name: string; location: string; reportCount: number }[];
  locations: { location: string; userCount: number }[];
}

const reportStatuses: Report['status'][] = [
  'Submitted',
  'Pending',
  'Under Review',
  'Verified',
  'Rejected',
  'Active',
  'Acknowledged',
  'Resolved',
];

const getReportStatus = (report: Report, cases: { reportId: string; status: string }[]): Report['status'] => {
  const caseRecord = cases.find((item) => item.reportId === report.id);
  if (!caseRecord) return report.status;
  if (caseRecord.status === 'MONITORING') return 'Acknowledged';
  if (caseRecord.status === 'RESOLVED') return 'Resolved';
  return 'Active';
};

export function HealthOfficialOverview() {
  const { token } = useAuth();
  const { reports, reportsError, cases, casesError, editReport, deleteReport } = useData();
  const { show } = useToast();
  const [registrationOverview, setRegistrationOverview] = useState<RegistrationOverview | null>(null);
  const [overviewError, setOverviewError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<{ type: 'user' | 'location'; id: string; label: string } | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [form, setForm] = useState({ disease: '', location: '', symptoms: '' });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    if (!token) {
      setOverviewError('Please log in again to view registration counts.');
      return () => controller.abort();
    }

    apiRequest<RegistrationOverview>('/users/overview', {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((overview) => {
        setRegistrationOverview(overview);
        setOverviewError('');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setOverviewError(error instanceof Error ? error.message : 'Unable to load registration counts.');
      });

    return () => controller.abort();
  }, [token]);

  const filteredReports = reports.filter((report) => {
    if (!selectedFilter) return true;
    if (selectedFilter.type === 'user') return report.reportedById === selectedFilter.id;
    return report.location.trim().toLocaleLowerCase() === selectedFilter.label.trim().toLocaleLowerCase();
  });
  const statusCounts = filteredReports.reduce<Record<Report['status'], number>>((counts, report) => {
    counts[getReportStatus(report, cases)] += 1;
    return counts;
  }, {
    Submitted: 0,
    Pending: 0,
    'Under Review': 0,
    Verified: 0,
    Rejected: 0,
    Active: 0,
    Acknowledged: 0,
    Resolved: 0,
  });

  const startEditing = (report: Report) => {
    setEditingReport(report);
    setForm({ disease: report.disease, location: report.location, symptoms: report.symptoms });
    setActionError('');
    setOpenMenu(null);
  };

  const saveReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingReport) return;
    setSaving(true);
    setActionError('');
    try {
      await editReport(editingReport.id, form);
      show('Report updated successfully.');
      setEditingReport(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this report.');
    } finally {
      setSaving(false);
    }
  };

  const removeReport = async (report: Report) => {
    if (!window.confirm(`Delete ${report.reportedBy}'s report for ${report.disease}? This will also remove its linked case tracking.`)) return;
    setActionError('');
    try {
      await deleteReport(report.id);
      show('Report deleted successfully.');
      setOpenMenu(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete this report.');
    }
  };

  return (
    <AppShell>
      <PageHeader title="User Overview" breadcrumb="User Overview" />
      {overviewError && <p role="alert" className="mb-4 text-sm text-danger-text">{overviewError}</p>}
      {reportsError && <p role="alert" className="mb-4 text-sm text-danger-text">{reportsError}</p>}
      {casesError && <p role="alert" className="mb-4 text-sm text-danger-text">{casesError}</p>}
      {actionError && !editingReport && <p role="alert" className="mb-4 text-sm text-danger-text">{actionError}</p>}
      {registrationOverview && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <section className="card overflow-hidden">
            <div className="border-b border-border p-5">
              <p className="text-sm text-ink-muted">Registered users</p>
              <p className="mt-1 text-2xl font-bold text-ink">{registrationOverview.registeredUserCount}</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Registration location</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationOverview.users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          aria-pressed={selectedFilter?.type === 'user' && selectedFilter.id === user.id}
                          onClick={() => setSelectedFilter(
                            selectedFilter?.type === 'user' && selectedFilter.id === user.id
                              ? null
                              : { type: 'user', id: user.id, label: user.name },
                          )}
                          className="font-medium text-primary hover:underline"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-muted">{user.location}</td>
                      <td className="px-4 py-3 text-right text-sm text-ink-muted">{user.reportCount}</td>
                    </tr>
                  ))}
                  {registrationOverview.users.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-ink-muted">No registered users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="text-base font-semibold text-ink">Registrations by location</h2>
              <p className="mt-1 text-sm text-ink-muted">Select a location to view cases reported there.</p>
            </div>
            <div className="divide-y divide-border">
              {registrationOverview.locations.map((location) => {
                const isSelected = selectedFilter?.type === 'location' && selectedFilter.label === location.location;
                return (
                  <button
                    key={location.location}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedFilter(
                      isSelected ? null : { type: 'location', id: location.location, label: location.location },
                    )}
                    className={`flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-slate-50 ${isSelected ? 'bg-primary-light' : ''}`}
                  >
                    <span className="text-sm font-medium text-ink">{location.location}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink-muted">
                      {location.userCount} {location.userCount === 1 ? 'user' : 'users'}
                    </span>
                  </button>
                );
              })}
              {registrationOverview.locations.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-ink-muted">No registration locations found.</p>
              )}
            </div>
          </section>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Cases</h2>
            {selectedFilter && <p className="mt-1 text-sm text-ink-muted">Filtered by {selectedFilter.type}: {selectedFilter.label}</p>}
            <p className="mt-1 text-sm text-ink-muted">
              Showing {filteredReports.length} reports across all statuses.
            </p>
          </div>
          {selectedFilter && (
            <button type="button" onClick={() => setSelectedFilter(null)} className="text-sm font-medium text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-4 lg:grid-cols-7">
          {reportStatuses.map((status) => (
            <div key={status} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-ink-muted">{status}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{statusCounts[status]}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Symptoms</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                    {reportsError ? 'Unable to load user reports.' : 'No user reports found.'}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const status = getReportStatus(report, cases);

                  return (
                    <tr key={report.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 text-sm font-medium text-ink">{report.reportedBy}</td>
                      <td className="px-4 py-3.5 text-sm text-ink-muted">{report.location}</td>
                      <td className="px-4 py-3.5 text-sm text-ink-muted">{report.disease}</td>
                      <td className="px-4 py-3.5 text-sm text-ink-muted">{report.symptoms || '—'}</td>
                      <td className="px-4 py-3.5"><Badge status={status} /></td>
                      <td className="px-4 py-3.5 text-right relative">
                        <button
                          type="button"
                          aria-label={`Actions for ${report.reportedBy}'s report`}
                          aria-haspopup="menu"
                          aria-expanded={openMenu === report.id}
                          onClick={() => setOpenMenu(openMenu === report.id ? null : report.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition"
                        >
                          <MoreVertical className="h-4 w-4 text-ink-muted" />
                        </button>
                        {openMenu === report.id && (
                          <div role="menu" className="absolute right-4 top-12 z-10 w-36 rounded-lg border border-border bg-white shadow-lg overflow-hidden">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => startEditing(report)}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-ink hover:bg-slate-50"
                            >
                              Edit report
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => void removeReport(report)}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-danger-text hover:bg-danger-bg border-t border-border"
                            >
                              Delete report
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingReport(null)}>
          <div className="card w-full max-w-lg animate-scale-in" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-ink">Edit Report</h2>
              <button type="button" aria-label="Close edit report" onClick={() => setEditingReport(null)} className="text-ink-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(event) => void saveReport(event)} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="edit-disease" className="label">Disease</label>
                <input id="edit-disease" value={form.disease} onChange={(event) => setForm((current) => ({ ...current, disease: event.target.value }))} className="input" required />
              </div>
              <div>
                <label htmlFor="edit-location" className="label">Location</label>
                <input id="edit-location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="input" required />
              </div>
              <div>
                <label htmlFor="edit-symptoms" className="label">Symptoms (separate with commas)</label>
                <textarea id="edit-symptoms" value={form.symptoms} onChange={(event) => setForm((current) => ({ ...current, symptoms: event.target.value }))} rows={3} className="input resize-none" required />
              </div>
              {actionError && <p role="alert" className="text-sm text-danger-text">{actionError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingReport(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
