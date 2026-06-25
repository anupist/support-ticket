'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export function useFirebaseAuth() {
  const { user, isLoading, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/verify');
        if (res.ok) {
          const data = await res.json();
          setUser({
            uid: data.uid,
            email: data.email || '',
            displayName: data.displayName || '',
            role: data.role || 'client',
            tenantId: data.tenantId || 'org_default',
          });
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      }
    }
    checkSession();
  }, [setUser, clearUser]);

  return { user, isLoading };
}