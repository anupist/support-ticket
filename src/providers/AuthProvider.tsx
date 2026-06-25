'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthContextValue {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string;
    customPermissions?: string[];
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
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const setUserStore = useAuthStore((s) => s.setUser);
  const clearUserStore = useAuthStore((s) => s.clearUser);
  const storeUser = useAuthStore((s) => s.user);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/verify');
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
          setTenantId(data.tenantId);
          setUserStore({
            uid: data.uid,
            email: data.email || '',
            displayName: data.displayName || '',
            role: data.role,
            tenantId: data.tenantId,
            avatarUrl: data.avatarUrl || '',
            customPermissions: data.customPermissions,
          });
        } else {
          clearUserStore();
        }
      } catch {
        clearUserStore();
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [setUserStore, clearUserStore]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Login failed');
    }

    const data = await res.json();
    setRole(data.user.role);
    setTenantId(data.user.tenantId);
    const userAvatar = data.user.avatarUrl || data.user.avatarURL || '';
    setUserStore({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      role: data.user.role,
      tenantId: data.user.tenantId,
      avatarUrl: userAvatar,
      customPermissions: data.user.customPermissions,
    });
  }, [setUserStore]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName: name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Registration failed');
    }

    const data = await res.json();
    const userAvatar = data.user.avatarUrl || data.user.avatarURL || '';
    setRole(data.user.role);
    setTenantId(data.user.tenantId);
    setUserStore({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      role: data.user.role,
      tenantId: data.user.tenantId,
      avatarUrl: userAvatar,
      customPermissions: data.user.customPermissions,
    });
  }, [setUserStore]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setRole(null);
    setTenantId(null);
    clearUserStore();
  }, [clearUserStore]);

  return (
    <AuthContext.Provider
      value={{
        user: storeUser
          ? { uid: storeUser.uid, email: storeUser.email, displayName: storeUser.displayName, avatarUrl: storeUser.avatarUrl, customPermissions: storeUser.customPermissions }
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