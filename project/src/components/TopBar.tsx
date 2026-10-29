import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, role, logout } = useAuth();
  const { alerts } = useData();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const notifCount = activeAlerts.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.name ?? '?').split(' ').map((w) => w[0]).slice(0, 2).join('');

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100">
          <svg className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((v) => !v)} className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 transition">
            <Bell className="h-5 w-5 text-ink-muted" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-icon px-1 text-[10px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="animate-scale-in absolute right-0 mt-2 w-80 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-ink">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-ink-muted text-center">No active alerts</p>
                ) : (
                  activeAlerts.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(role === 'official' ? '/admin/alerts' : '/alerts', {
                          state: { selectedAlertId: a.id },
                        });
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-border last:border-0"
                    >
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-danger-icon shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ink">{a.disease} alert in {a.location}</p>
                        <p className="text-xs text-ink-muted mt-0.5">{a.message}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen((v) => !v)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-ink leading-tight">{user?.name}</p>
              <p className="text-xs text-ink-muted leading-tight">{role === 'official' ? 'Health Official' : 'Citizen'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-ink-muted" />
          </button>
          {dropdownOpen && (
            <div className="animate-scale-in absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
              <button
                onClick={() => { setDropdownOpen(false); navigate(role === 'official' ? '/admin/profile' : '/profile'); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger-text hover:bg-danger-bg border-t border-border"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
