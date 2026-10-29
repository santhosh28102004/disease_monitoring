import { Bug, Activity, Thermometer, Wind } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { diseaseInfo } from '@/data/mockData';

const iconMap: Record<string, typeof Bug> = { Bug, Activity, Thermometer, Wind };

export function DiseaseInformation() {
  return (
    <AppShell>
      <PageHeader title="Disease Information" breadcrumb="Disease Information" />
      <div className="grid md:grid-cols-2 gap-6">
        {diseaseInfo.map((d) => {
          const Icon = iconMap[d.icon] ?? Bug;
          return (
            <div key={d.name} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{d.name}</h3>
                </div>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">{d.description}</p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ink mb-2">Symptoms to watch for</p>
                  <ul className="space-y-1.5">
                    {d.symptoms.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-ink-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger-icon shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink mb-2">Prevention tips</p>
                  <ul className="space-y-1.5">
                    {d.prevention.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-ink-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success-icon shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
