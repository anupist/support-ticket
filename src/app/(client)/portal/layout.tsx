'use client';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { PusherProvider } from '@/providers/PusherProvider';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Ticket, Home } from 'lucide-react';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: Home },
  { href: '/portal/tickets', label: 'My Tickets', icon: Ticket },
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-sidebar flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Support Portal</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center justify-end gap-1 px-6 shrink-0">
          <NotificationBell />
          <ProfileDropdown />
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
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