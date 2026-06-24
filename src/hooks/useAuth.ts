'use client';

import { useAuthStore } from '@/stores/authStore';
import { getFirebaseAuth } from '@/lib/firebase-client';
import { onAuthChange } from '@/lib/auth';
import { useEffect } from 'react';

export function useFirebaseAuth() {
  const { user, isLoading, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: (tokenResult.claims.role as any) || 'client',
          tenantId: (tokenResult.claims.tenantId as string) || 'org_default',
        });
      } else {
        clearUser();
      }
    });
    return unsub;
  }, [setUser, clearUser]);

  return { user, isLoading };
}
