'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar } from '@/components/ui/avatar';
import { User, Key, LogOut } from 'lucide-react';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push('/auth/login');
  }

  const rawAvatar = user?.avatarUrl || '';
  const resolvedAvatar = rawAvatar.startsWith('media:')
    ? `/api/media/${rawAvatar.replace('media:', '')}`
    : rawAvatar || undefined;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
      >
        <Avatar src={resolvedAvatar} fallback={user?.displayName || 'U'} size="sm" />
        <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-card shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => { setOpen(false); router.push('/profile'); }}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4" />
              Update Profile
            </button>
            <button
              onClick={() => { setOpen(false); router.push('/profile/password'); }}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Key className="h-4 w-4" />
              Change Password
            </button>
          </div>
          <div className="border-t p-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}