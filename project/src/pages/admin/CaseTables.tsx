import { useState } from 'react';
import { Check, Eye, RotateCcw, Trash2, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { useData } from '@/context/DataContext';
import type { Report } from '@/data/mockData';
import { useToast } from '@/components/Toast';

const PAGE_SIZE = 8;

function CaseTable({ title, filter }: { title: string; filter: (r: Report) => boolean }) {
  const { reports, reportsError } = useData();
  const filtered = reports.filter(filter);
  const [page, setPage] = useState(1);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <PageHeader title={title} breadcrumb={title} />
      {reportsError && <p role="alert" className="mb-4 text-sm text-danger-text">{reportsError}</p>}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Reported By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Severity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">No cases found.</td></tr>
              ) : (
                pageItems.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-sm font-medium text-ink">{r.disease}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{r.location}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{r.reportedBy}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{new Date(r.dateObserved).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5"><Badge status={r.severity} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => setViewReport(r)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary-light transition">
                        <Eye className="h-4 w-4" /> View
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

      {viewReport && <ReportModal report={viewReport} onClose={() => setViewReport(null)} />}
    </AppShell>
  );
}

export function VerifiedCases() {
  return <CaseTable title="Verified Cases" filter={(r) => ['Verified', 'Active', 'Acknowledged', 'Resolved'].includes(r.status)} />;
}

export function ActiveCases() {
  const { reports, reportsError, cases, casesError, updateCaseStatus, deleteCase } = useData();
  const { show } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyCase, setBusyCase] = useState<string | null>(null);
  const [error, setError] = useState('');
  const activeCases = cases
    .filter((item) => item.status === 'ACTIVE' || item.status === 'MONITORING')
    .map((item) => ({ caseRecord: item, report: reports.find((report) => report.id === item.reportId) }))
    .filter((item): item is { caseRecord: typeof cases[number]; report: Report } => Boolean(item.report));

  const changeStatus = async (caseId: string, status: 'ACTIVE' | 'MONITORING' | 'RESOLVED') => {
    setBusyCase(caseId);
    setError('');
    try {
      await updateCaseStatus(caseId, status, notes[caseId] ?? '');
      setNotes((previous) => ({ ...previous, [caseId]: '' }));
      show(status === 'MONITORING' ? 'Case acknowledged.' : `Case marked ${status.toLowerCase()}.`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to update this case.');
    } finally {
      setBusyCase(null);
    }
  };

  const removeCase = async (caseId: string) => {
    if (!window.confirm('Remove active-case tracking? The citizen report will remain in their report history.')) return;
    setBusyCase(caseId);
    setError('');
    try {
      await deleteCase(caseId);
      show('Case tracking removed. The citizen report was kept.');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to remove this case.');
    } finally {
      setBusyCase(null);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Active Cases" breadcrumb="Active Cases" />
      {(error || reportsError || casesError) && <p role="alert" className="mb-4 text-sm text-danger-text">{error || reportsError || casesError}</p>}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Reported By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Observation</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCases.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">No active cases to track.</td></tr>
              ) : activeCases.map(({ caseRecord, report }) => (
                <tr key={caseRecord.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3.5 text-sm font-medium text-ink">{report.disease}<div className="mt-1"><Badge status={report.severity} /></div></td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{report.location}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{report.reportedBy}</td>
                  <td className="px-4 py-3.5"><Badge status={caseRecord.status === 'MONITORING' ? 'Acknowledged' : 'Active'} /></td>
                  <td className="px-4 py-3.5 min-w-56">
                    <textarea
                      value={notes[caseRecord.id] ?? ''}
                      onChange={(event) => setNotes((previous) => ({ ...previous, [caseRecord.id]: event.target.value }))}
                      rows={2}
                      placeholder="Add an observation for the citizen"
                      className="input resize-y"
                    />
                    {report.updatedAt && <p className="mt-1 text-xs text-ink-muted">Updated {new Date(report.updatedAt).toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button disabled={busyCase === caseRecord.id} onClick={() => void changeStatus(caseRecord.id, 'ACTIVE')} className="btn-secondary px-2 py-1.5 text-xs"><RotateCcw className="h-3.5 w-3.5" /> Active</button>
                      <button disabled={busyCase === caseRecord.id} onClick={() => void changeStatus(caseRecord.id, 'MONITORING')} className="btn-secondary px-2 py-1.5 text-xs"><Check className="h-3.5 w-3.5" /> Acknowledge</button>
                      <button disabled={busyCase === caseRecord.id} onClick={() => void changeStatus(caseRecord.id, 'RESOLVED')} className="btn-success px-2 py-1.5 text-xs">Resolved</button>
                      <button disabled={busyCase === caseRecord.id} onClick={() => void removeCase(caseRecord.id)} className="btn-danger px-2 py-1.5 text-xs"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function ReportModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const rows: [string, string][] = [
    ['Report ID', report.id],
    ['Reported By', report.reportedBy],
    ['Disease/Symptoms', report.disease],
    ['Symptoms', report.symptoms],
    ['Affected People', String(report.affectedPeople)],
    ['Location', report.location],
    ['Date Observed', new Date(report.dateObserved).toLocaleDateString()],
    ['Severity', report.severity],
    ['Description', report.description || '—'],
    ['Status', report.status],
    ['Verification Notes', report.verificationNotes || '—'],
    ['Last Updated', report.updatedAt ? new Date(report.updatedAt).toLocaleString() : '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="animate-scale-in w-full max-w-lg card max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">Report Details</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-sm text-ink-muted shrink-0">{label}</span>
              <span className="text-sm text-ink font-medium text-right">{value}</span>
            </div>
          ))}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <section className="border-t border-border pt-4">
              <h4 className="mb-3 text-sm font-semibold text-ink">Status and observation history</h4>
              <div className="space-y-3">
                {[...report.statusHistory].reverse().map((entry, index) => (
                  <div key={`${entry.updatedAt}-${index}`} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge status={entry.status} />
                      <time className="text-xs text-ink-muted">{new Date(entry.updatedAt).toLocaleString()}</time>
                    </div>
                    {entry.notes && <p className="mt-2 text-sm text-ink">{entry.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
