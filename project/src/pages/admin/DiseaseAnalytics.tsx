import { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import { FileText, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import {
  analyticsStats, healthOfficialStats, diseaseDistribution, casesOverTime,
  severityDistribution, casesByLocation,
} from '@/data/mockData';

const ranges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

export function DiseaseAnalytics() {
  const { user } = useAuth();
  const [range, setRange] = useState(ranges[0]);
  const stats = user?.accountRole === 'HEALTH_OFFICIAL' ? healthOfficialStats : analyticsStats;

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Disease Analytics</h1>
          <nav className="mt-1 flex items-center gap-1.5 text-sm">
            <span className="text-primary font-medium">Dashboard</span>
            <span className="text-ink-muted">/</span>
            <span className="text-ink-muted">Disease Analytics</span>
          </nav>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="input w-auto">
          {ranges.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total Reports" value={stats.totalReports.toLocaleString()} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard icon={ShieldCheck} label="Verified Cases" value={stats.verifiedCases.toLocaleString()} iconBg="bg-success-bg" iconColor="text-success-icon" />
        <StatCard icon={Activity} label="Active Cases" value={stats.activeCases.toLocaleString()} iconBg="bg-warning-bg" iconColor="text-warning-icon" />
        <StatCard icon={CheckCircle2} label="Resolved Cases" value={stats.resolvedCases.toLocaleString()} iconBg="bg-success-bg" iconColor="text-success-icon" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disease Distribution Donut */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Disease Wise Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diseaseDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {diseaseDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {diseaseDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-ink-muted">{d.name}</span>
                <span className="ml-auto font-medium text-ink">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cases Over Time */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Cases Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={casesOverTime}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip />
                <Area type="monotone" dataKey="cases" stroke="#3B82F6" strokeWidth={2} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Cases by Severity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {severityDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-6">
            {severityDistribution.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-ink-muted">{s.name}</span>
                <span className="font-medium text-ink">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cases by Location */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Cases by Location (Top 5)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesByLocation} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis type="category" dataKey="location" tick={{ fontSize: 12, fill: '#64748B' }} width={90} />
                <Tooltip />
                <Bar dataKey="cases" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
