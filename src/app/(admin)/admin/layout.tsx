'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { PusherProvider } from '@/providers/PusherProvider';
import { useAuthStore } from '@/stores/authStore';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { can } from '@/lib/permissions';
import type { Role } from '@/types';
import {
  LayoutDashboard,
  Ticket,
  Users,
  FolderTree,
  Settings,
  Shield,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: any; permission?: string };

const allNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket, permission: 'ticket.list' },
  { href: '/admin/users', label: 'Users', icon: Users, permission: 'user.list' },
  { href: '/admin/roles', label: 'Roles', icon: Shield, permission: 'user.manage' },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, permission: 'category.manage' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings.view' },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storeUser = useAuthStore((s) => s.user);
  const role = storeUser?.role as Role | undefined;
  const customPermissions = storeUser ? (storeUser as any).customPermissions : undefined;

  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    if (!role) return false;
    return can(role, item.permission as any, customPermissions);
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-white/10">
          <h2 className="text-base font-bold tracking-tight">Coder71 Support</h2>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card flex items-center justify-end gap-1 px-6 shrink-0">
          <NotificationBell />
          <ProfileDropdown />
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PusherProvider>
        <AdminShell>{children}</AdminShell>
      </PusherProvider>
    </AuthProvider>
  );
}