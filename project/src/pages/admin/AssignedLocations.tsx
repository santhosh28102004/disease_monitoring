import { useState } from 'react';
import { Search } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Badge } from '@/components/Badge';
import { mockLocations, type RiskLevel } from '@/data/mockData';

const riskFilters: ('All' | RiskLevel)[] = ['All', 'High', 'Medium', 'Low'];

export function AssignedLocations() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');

  const filtered = mockLocations.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'All' || l.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  return (
    <AppShell>
      <PageHeader title="Assigned Locations" breadcrumb="Assigned Locations" />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations..." className="input pl-10" />
        </div>
        <div className="flex gap-2">
          {riskFilters.map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                riskFilter === r ? 'bg-primary text-white' : 'bg-white text-ink-muted border border-border hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Total Reports</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Verified Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Active Cases</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">No locations found.</td></tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.name} className="border-b border-border last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-sm font-medium text-ink">{l.name}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{l.totalReports}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{l.verifiedCases}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{l.activeCases}</td>
                    <td className="px-4 py-3.5"><Badge status={l.riskLevel} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
