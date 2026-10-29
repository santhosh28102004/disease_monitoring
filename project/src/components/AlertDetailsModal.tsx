import { X } from 'lucide-react';
import { Badge } from '@/components/Badge';
import type { Alert } from '@/data/mockData';

export function AlertDetailsModal({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-details-title"
        className="card w-full max-w-lg animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="alert-details-title" className="text-lg font-semibold text-ink">Disease Alert Details</h2>
          <button type="button" aria-label="Close alert details" onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Disease</p>
            <p className="mt-1 text-base font-semibold text-ink">{alert.disease}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</p>
              <p className="mt-1 text-sm text-ink">{alert.location}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Cases</p>
              <p className="mt-1 text-sm text-ink">{alert.cases}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Risk Level</p>
              <div className="mt-1"><Badge status={alert.riskLevel} /></div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</p>
              <div className="mt-1"><Badge status={alert.status} /></div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Alert Information</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{alert.message}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Date</p>
            <p className="mt-1 text-sm text-ink">{new Date(alert.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
