import { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { AlertDetailsModal } from '@/components/AlertDetailsModal';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/Toast';
import { DISEASES, LOCATIONS, type RiskLevel } from '@/data/mockData';

export function AlertsManagement() {
  const { alerts, addAlert, updateAlert, deleteAlert } = useData();
  const { show } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const visibleAlerts = user?.accountRole === 'HEALTH_OFFICIAL'
    ? alerts.filter((alert) => alert.status === 'Active')
    : alerts;
  const selectedAlertId = (location.state as { selectedAlertId?: string } | null)?.selectedAlertId;
  const [modalOpen, setModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [detailAlertId, setDetailAlertId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    disease: '', location: '', riskLevel: 'Low' as RiskLevel, message: '', date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!selectedAlertId) return;
    setDetailAlertId(selectedAlertId);
    navigate(location.pathname, { replace: true, state: null });
  }, [selectedAlertId, location.pathname, navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAlert({ ...form, cases: 0, status: 'Active' });
    show('Alert created successfully!');
    setModalOpen(false);
    setForm({ disease: '', location: '', riskLevel: 'Low', message: '', date: new Date().toISOString().slice(0, 10) });
  };

  const handleAction = (id: string, action: 'Acknowledge' | 'Resolve' | 'Delete') => {
    if (action === 'Acknowledge') { updateAlert(id, { status: 'Acknowledged' }); show('Alert acknowledged.'); }
    if (action === 'Resolve') { updateAlert(id, { status: 'Resolved' }); show('Alert resolved.'); }
    if (action === 'Delete') { deleteAlert(id); show('Alert deleted.'); }
    setOpenMenu(null);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Alerts Management</h1>
          <nav className="mt-1 flex items-center gap-1.5 text-sm">
            <span className="text-primary font-medium">Dashboard</span>
            <span className="text-ink-muted">/</span>
            <span className="text-ink-muted">Alerts</span>
          </nav>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Create Alert
        </button>
      </div>

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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-muted">
                    {user?.accountRole === 'HEALTH_OFFICIAL' ? 'No active alerts.' : 'No alerts found.'}
                  </td>
                </tr>
              ) : visibleAlerts.map((a, i) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{i + 1}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-ink">{a.disease}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{a.location}</td>
                  <td className="px-4 py-3.5"><Badge status={a.riskLevel} /></td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{a.cases}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted max-w-xs truncate">{a.message}</td>
                  <td className="px-4 py-3.5 text-sm text-ink-muted">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5"><Badge status={a.status} /></td>
                  <td className="px-4 py-3.5 text-right relative">
                    <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition">
                      <MoreVertical className="h-4 w-4 text-ink-muted" />
                    </button>
                    {openMenu === a.id && (
                      <div ref={menuRef} className="animate-scale-in absolute right-4 top-12 z-10 w-40 rounded-lg border border-border bg-white shadow-lg overflow-hidden">
                        {a.status === 'Active' && (
                          <button onClick={() => handleAction(a.id, 'Acknowledge')} className="flex w-full items-center px-4 py-2.5 text-sm text-ink hover:bg-slate-50">Acknowledge</button>
                        )}
                        {a.status !== 'Resolved' && (
                          <button onClick={() => handleAction(a.id, 'Resolve')} className="flex w-full items-center px-4 py-2.5 text-sm text-ink hover:bg-slate-50">Resolve</button>
                        )}
                        <button onClick={() => handleAction(a.id, 'Delete')} className="flex w-full items-center px-4 py-2.5 text-sm text-danger-text hover:bg-danger-bg border-t border-border">Delete</button>
                      </div>
                    )}
                  </td>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="animate-scale-in w-full max-w-md card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-ink">Create Alert</h3>
              <button onClick={() => setModalOpen(false)} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4 space-y-4">
              <div>
                <label className="label">Disease</label>
                <select value={form.disease} onChange={(e) => setForm((p) => ({ ...p, disease: e.target.value }))} className="input" required>
                  <option value="">Select disease</option>
                  {DISEASES.map((d) => <option key={d} value={d.split('-')[0]}>{d.split('-')[0]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <select value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="input" required>
                  <option value="">Select location</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Risk Level</label>
                <select value={form.riskLevel} onChange={(e) => setForm((p) => ({ ...p, riskLevel: e.target.value as RiskLevel }))} className="input">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={3} className="input resize-none" required />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="input" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
