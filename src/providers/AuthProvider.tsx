'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import { onAuthChange, loginWithEmail, registerWithEmail, logout as authLogout } from '@/lib/auth';

interface AuthContextValue {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  loading: boolean;
  role: string | null;
  tenantId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const setUserStore = useAuthStore((s) => s.setUser);
  const clearUserStore = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const tokenResult = await fbUser.getIdTokenResult();
        const claimsRole = (tokenResult.claims.role as string) || 'client';
        const claimsTenant = (tokenResult.claims.tenantId as string) || 'org_default';
        setRole(claimsRole);
        setTenantId(claimsTenant);

        setUserStore({
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || '',
          role: claimsRole as any,
          tenantId: claimsTenant,
        });

        setLoading(false);
      } else {
        setRole(null);
        setTenantId(null);
        clearUserStore();
        setLoading(false);
      }
    });
    return unsub;
  }, [setUserStore, clearUserStore]);

  const login = useCallback(async (email: string, password: string) => {
    await loginWithEmail(email, password);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await registerWithEmail(email, password, name);
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setFirebaseUser(null);
    setRole(null);
    setTenantId(null);
    clearUserStore();
  }, [clearUserStore]);

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
          : null,
        loading,
        role,
        tenantId,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
