import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, ClipboardList, HeartPulse, Bell, User,
  ShieldCheck, LogOut, X, Activity, MapPin, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const citizenNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'Report Issue', icon: FilePlus },
  { to: '/my-reports', label: 'My Reports', icon: ClipboardList },
  { to: '/disease-info', label: 'Disease Information', icon: HeartPulse },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
  { to: '/profile', label: 'Profile', icon: User },
];

const officialNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pending', label: 'Pending Reports', icon: ClipboardList, badge: true },
  { to: '/admin/verified', label: 'Verified Cases', icon: ShieldCheck },
  { to: '/admin/active', label: 'Active Cases', icon: Activity },
  { to: '/admin/locations', label: 'Assigned Locations', icon: MapPin },
  { to: '/admin/analytics', label: 'Disease Analytics', icon: BarChart3 },
  { to: '/admin/alerts', label: 'Alerts', icon: Bell },
  { to: '/admin/profile', label: 'Profile', icon: User },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, user, logout } = useAuth();
  const { reports, alerts } = useData();
  const nav = role === 'official'
    ? user?.accountRole === 'HEALTH_OFFICIAL'
      ? [
          ...officialNav.slice(0, 1),
          { to: '/official/user-overview', label: 'User Overview', icon: ClipboardList },
          ...officialNav.slice(1),
        ]
      : officialNav
    : citizenNav;

  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const activeAlertCount = alerts.filter((a) => a.status === 'Active').length;

  const getBadge = (item: typeof nav[number]) => {
    if (item.badge && role === 'official' && item.label === 'Pending Reports') return pendingCount;
    if (item.badge && role === 'citizen' && item.label === 'Alerts') return activeAlertCount;
    return null;
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />}
      <aside className={`fixed z-40 h-full w-[260px] bg-sidebar-bg flex flex-col transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">Health Surveillance</p>
            <p className="text-sm font-bold text-white leading-tight">System</p>
          </div>
          <button onClick={onClose} className="ml-auto md:hidden">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {nav.map((item) => {
            const badge = getBadge(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
                {badge != null && badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger-icon px-1.5 text-xs font-bold text-white">
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
