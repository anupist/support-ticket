import { create } from 'zustand';
import type { Role } from '@/types';

interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: Role;
    tenantId: string;
    avatarUrl: string;
    customPermissions?: string[];
  } | null;
  isLoading: boolean;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
