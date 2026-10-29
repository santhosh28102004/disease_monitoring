import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, breadcrumb }: { title: string; breadcrumb: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <nav className="mt-1 flex items-center gap-1.5 text-sm">
        <span className="text-primary font-medium">Dashboard</span>
        <span className="text-ink-muted">/</span>
        <span className="text-ink-muted">{breadcrumb}</span>
      </nav>
    </div>
  );
}
