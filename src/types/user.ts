import type { BaseDocument, Role } from './common';

export interface User extends BaseDocument {
  email: string;
  displayName: string;
  avatarURL: string;
  role: Role;
  organizationId: string;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  metadata: {
    lastLoginAt: number | null;
    ticketCount: number;
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  role?: Role;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: Role;
  isActive?: boolean;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
}
