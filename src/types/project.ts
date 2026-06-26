import type { BaseDocument } from './common';

export interface Project extends BaseDocument {
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdBy: string;
  organizationId: string;
  ticketCount?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}
