import type { Status, Severity, RiskLevel, AlertStatus } from '@/data/mockData';

type BadgeKind = Status | Severity | RiskLevel | AlertStatus;

const styles: Record<string, string> = {
  Verified: 'bg-success-bg text-success-text',
  Resolved: 'bg-success-bg text-success-text',
  Active: 'bg-danger-bg text-danger-text',
  Acknowledged: 'bg-warning-bg text-warning-text',
  Low: 'bg-success-bg text-success-text',
  Pending: 'bg-warning-bg text-warning-text',
  Medium: 'bg-warning-bg text-warning-text',
  'Under Review': 'bg-warning-bg text-warning-text',
  Rejected: 'bg-danger-bg text-danger-text',
  High: 'bg-danger-bg text-danger-text',
};

export function Badge({ status }: { status: BadgeKind }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
