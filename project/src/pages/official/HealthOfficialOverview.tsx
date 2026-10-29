import { useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { useData } from '@/context/DataContext';
import type { Report } from '@/data/mockData';
import { useToast } from '@/components/Toast';

export function HealthOfficialOverview() {
  const { reports, reportsError, cases, casesError, editReport, deleteReport } = useData();
  const { show } = useToast();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [form, setForm] = useState({ disease: '', location: '', symptoms: '' });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

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
      {reportsError && <p role="alert" className="mb-4 text-sm text-danger-text">{reportsError}</p>}
      {casesError && <p role="alert" className="mb-4 text-sm text-danger-text">{casesError}</p>}
      {actionError && !editingReport && <p role="alert" className="mb-4 text-sm text-danger-text">{actionError}</p>}
      <div className="card overflow-hidden">
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
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                    {reportsError ? 'Unable to load user reports.' : 'No user reports found.'}
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const caseRecord = cases.find((item) => item.reportId === report.id);
                  const status = caseRecord
                    ? caseRecord.status === 'MONITORING'
                      ? 'Acknowledged'
                      : caseRecord.status === 'RESOLVED'
                        ? 'Resolved'
                        : 'Active'
                    : report.status;

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
