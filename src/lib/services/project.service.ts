import { prisma } from '@/lib/prisma';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import type { Project, CreateProjectInput } from '@/types';
import { NotFoundError } from '@/lib/errors';

export async function createProject(input: CreateProjectInput, userId: string): Promise<Project> {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description || null,
      createdBy: userId,
      tenantId: DEFAULT_TENANT_ID,
      organizationId: DEFAULT_TENANT_ID,
    },
  });
  return mapProjectRow(project);
}

export async function getProject(id: string): Promise<Project> {
  const project = await prisma.project.findUnique({
    where: { id },
  });
  if (!project) throw new NotFoundError('Project');
  return mapProjectRow(project);
}

export async function getProjectsByUser(tenantId: string, userId?: string): Promise<Project[]> {
  const where: Record<string, unknown> = { tenantId };
  if (userId) where.createdBy = userId;

  const projects = await prisma.project.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
  });
  return projects.map(mapProjectRow);
}

export async function updateProject(id: string, input: { name?: string; description?: string }): Promise<Project> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;

  const project = await prisma.project.update({
    where: { id },
    data: data as any,
  });
  if (!project) throw new NotFoundError('Project');
  return mapProjectRow(project);
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.ticket.updateMany({
    where: { projectId: id },
    data: { projectId: null, projectName: null },
  });
  await prisma.project.delete({ where: { id } });
}

export async function getProjectTicketStats(tenantId: string, userId?: string): Promise<{ name: string; value: number }[]> {
  const where: Record<string, unknown> = { tenantId };
  if (userId) where.createdBy = userId;

  const tickets = await prisma.ticket.findMany({
    where: where as any,
    select: { projectName: true, projectId: true },
  });

  const counts: Record<string, number> = {};
  for (const t of tickets) {
    const name = t.projectName || 'General';
    counts[name] = (counts[name] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function mapProjectRow(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    status: row.status,
    createdBy: row.createdBy,
    tenantId: row.tenantId,
    organizationId: row.organizationId,
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
  };
}
