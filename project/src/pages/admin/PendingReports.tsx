import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/Toast';
import type { Status } from '@/data/mockData';

const PAGE_SIZE = 8;

export function PendingReports() {
  const navigate = useNavigate();
  const { reports, reportsError } = useData();
  const pending = reports.filter((r) => r.status === 'Pending');
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  const pageItems = pending.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <PageHeader title="Pending Reports" breadcrumb="Pending Reports" />
      {reportsError && <p role="alert" className="mb-4 text-sm text-danger-text">{reportsError}</p>}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Report ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Reported By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Severity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">No pending reports.</td></tr>
              ) : (
                pageItems.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-sm font-medium text-ink">{r.id}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{r.reportedBy}</td>
                    <td className="px-4 py-3.5 text-sm text-ink">{r.disease}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{r.location}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{new Date(r.dateObserved).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5"><Badge status={r.severity} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => navigate(`/admin/verify/${r.id}`)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary-light transition">
                        <Eye className="h-4 w-4" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 text-sm disabled:opacity-50">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium transition ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-ink-muted border border-border hover:bg-slate-50'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </AppShell>
  );
}

export function VerifyReport() {
  const navigate = useNavigate();
  const { reports, updateReport } = useData();
  const { show } = useToast();
  const id = window.location.pathname.split('/').pop() ?? '';
  const report = reports.find((r) => r.id === id);
  const [status, setStatus] = useState<Status>('Under Review');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!report) {
    return (
      <AppShell>
        <PageHeader title="Verify Report" breadcrumb="Verify Report" />
        <div className="card p-8 text-center">
          <p className="text-ink-muted">Report not found.</p>
          <button onClick={() => navigate('/admin/pending')} className="btn-secondary mt-4">Back to Pending Reports</button>
        </div>
      </AppShell>
    );
  }

  const handleAction = async (newStatus: Status) => {
    setSubmitting(true);
    setActionError('');
    try {
      await updateReport(report.id, { status: newStatus, verificationNotes: notes, followUpDate: followUp });
      show(`Report ${newStatus === 'Verified' ? 'verified and moved to active cases' : 'rejected'} successfully!`);
      navigate('/admin/pending');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update the report.');
    } finally {
      setSubmitting(false);
    }
  };

  const detailRows: [string, string][] = [
    ['Report ID', report.id],
    ['Reported By', report.reportedBy],
    ['Disease/Symptoms', report.disease],
    ['Symptoms', report.symptoms],
    ['Affected People', String(report.affectedPeople)],
    ['Location', report.location],
    ['Date Observed', new Date(report.dateObserved).toLocaleDateString()],
    ['Severity', report.severity],
    ['Description', report.description || '—'],
  ];

  return (
    <AppShell>
      <PageHeader title="Verify Report" breadcrumb="Verify Report" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Report Details</h2>
          <div className="space-y-3">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2 border-b border-border last:border-0">
                <span className="text-sm text-ink-muted shrink-0">{label}</span>
                <span className="text-sm text-ink font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-ink-muted mb-2">Uploaded Image</p>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-border bg-slate-50">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200">
                  <X className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-2 text-xs text-ink-muted">No image uploaded</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Verification</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="input">
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="label">Observation/Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Enter your clinical observations..." className="input resize-none" />
            </div>
            <div>
              <label className="label">Follow Up Date (Optional)</label>
              <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="input" />
            </div>
            {actionError && <p role="alert" className="text-sm text-danger-text">{actionError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button disabled={submitting} onClick={() => void handleAction('Rejected')} className="btn-danger">Reject</button>
              <button disabled={submitting} onClick={() => void handleAction('Verified')} className="btn-success">{submitting ? 'Saving...' : 'Verify'}</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
