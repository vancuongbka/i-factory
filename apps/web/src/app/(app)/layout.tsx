import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { QueryProvider } from '@/providers/query-provider';
import { FactoryProvider } from '@/providers/factory-provider';
import { SidebarProvider } from '@/providers/sidebar-provider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <FactoryProvider>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </FactoryProvider>
    </QueryProvider>
  );
}
