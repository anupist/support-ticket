'use client';

import { useState } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { PusherProvider } from '@/providers/PusherProvider';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Ticket, Home, FolderKanban, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: Home },
  { href: '/portal/tickets', label: 'My Tickets', icon: Ticket },
  { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
      <div className="h-14 flex items-center px-6 border-b border-white/10">
        <h2 className="text-base font-bold tracking-tight">Support Portal</h2>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-l-red-500 pl-[10px]'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 animate-slide-in">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card flex items-center justify-between gap-1 px-4 lg:px-6 shrink-0">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <ProfileDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PusherProvider>
        <PortalShell>{children}</PortalShell>
      </PusherProvider>
    </AuthProvider>
  );
}
