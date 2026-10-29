import { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import type { Report, Severity, Status } from '@/data/mockData';

const tabs: ('All' | Status)[] = ['All', 'Submitted', 'Pending', 'Under Review', 'Verified', 'Active', 'Acknowledged', 'Resolved', 'Rejected'];
const PAGE_SIZE = 5;

export function MyReports() {
  const { user } = useAuth();
  const { reports, reportsError, locationCases, locationCasesError } = useData();
  const [activeTab, setActiveTab] = useState<'All' | Status>('All');
  const [page, setPage] = useState(1);
  const [viewReport, setViewReport] = useState<Report | null>(null);

  const reportsById = new Map(reports.map((report) => [report.id, report]));
  locationCases.forEach((caseItem) => {
    const existingReport = reportsById.get(caseItem.id);
    const severity = ['Low', 'Medium', 'High'].includes(caseItem.severity)
      ? caseItem.severity as Severity
      : 'Low';
    reportsById.set(caseItem.id, existingReport
      ? { ...existingReport, status: caseItem.status }
      : {
        id: caseItem.id,
        reportedBy: 'Location report',
        disease: caseItem.disease,
        symptoms: caseItem.symptoms.join(', '),
        affectedPeople: caseItem.affectedPeople,
        location: user?.location ?? '',
        dateObserved: caseItem.dateObserved,
        severity,
        description: '',
        status: caseItem.status,
        verificationNotes: '',
        followUpDate: '',
        createdAt: caseItem.dateObserved,
      });
  });
  const allReports = [...reportsById.values()].sort(
    (first, second) => new Date(second.dateObserved).getTime() - new Date(first.dateObserved).getTime(),
  );
  const visibleReports = activeTab === 'All'
    ? allReports
    : allReports.filter((report) => report.status === activeTab);

  const totalPages = Math.max(1, Math.ceil(visibleReports.length / PAGE_SIZE));
  const pageItems = visibleReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const currentViewReport = viewReport
    ? allReports.find((report) => report.id === viewReport.id) ?? viewReport
    : null;

  const tabCount = (tab: 'All' | Status) => {
    if (tab === 'All') return allReports.length;
    return allReports.filter((report) => report.status === tab).length;
  };

  return (
    <AppShell>
      <PageHeader title="My Reports" breadcrumb="My Reports" />
      {reportsError && <p role="alert" className="mb-4 text-sm text-danger-text">{reportsError}</p>}
      {locationCasesError && <p role="alert" className="mb-4 text-sm text-danger-text">{locationCasesError}</p>}
      <p className="mb-4 text-sm text-ink-muted">Reports submitted in your location, including your reports and their latest status.</p>

      <div className="flex gap-2 mb-5 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab}
            <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
              activeTab === tab ? 'bg-primary text-white' : 'bg-slate-200 text-ink-muted'
            }`}>
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease/Symptoms</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Date Observed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">No reports found in this category.</td></tr>
              ) : (
                pageItems.map((r, i) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-ink">{r.disease}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{r.location}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{new Date(r.dateObserved).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5"><Badge status={r.status} /></td>
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
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                page === i + 1 ? 'bg-primary text-white' : 'bg-white text-ink-muted border border-border hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      )}

      {currentViewReport && <ReportModal report={currentViewReport} onClose={() => setViewReport(null)} />}
    </AppShell>
  );
}

function ReportModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const rows = [
    ['Report ID', report.id],
    ['Disease/Symptoms', report.disease],
    ['Symptoms', report.symptoms],
    ['Affected People', String(report.affectedPeople)],
    ['Location', report.location],
    ['Date Observed', new Date(report.dateObserved).toLocaleDateString()],
    ['Severity', report.severity],
    ['Description', report.description || '—'],
    ['Status', report.status],
    ['Verification Notes', report.verificationNotes || '—'],
    ['Follow Up Date', report.followUpDate ? new Date(report.followUpDate).toLocaleDateString() : '—'],
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
