// app/dashboard/layout.tsx
import type { ReactNode } from 'react';
// If your sidebar lives somewhere else, fix this path:
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <aside className="w-64 shrink-0 border-r border-white/10 bg-white/5">
        <Sidebar />
      </aside>
      <section className="flex-1 p-6">
        {children}
      </section>
    </div>
  );
}
