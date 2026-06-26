import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getProject, updateProject, deleteProject } from '@/lib/services/project.service';
import { updateProjectSchema } from '@/lib/validations/project.schema';
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';

export const GET = createHandler(async (req, { user, params }) => {
  const project = await getProject(params.id);
  if (user.role === 'client' && project.createdBy !== user.uid) {
    throw new ForbiddenError('You do not have access to this project');
  }
  return NextResponse.json({ project });
});

export const PATCH = createHandler(
  async (req, { user, params }) => {
    const project = await getProject(params.id);
    if (user.role === 'client' && project.createdBy !== user.uid) {
      throw new ForbiddenError('You do not have access to this project');
    }

    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(parsed.error.errors.map((e) => [e.path.join('.'), [e.message]]))
      );
    }

    const updated = await updateProject(params.id, parsed.data);
    return NextResponse.json({ project: updated });
  },
  { permissions: ['project.manage'] }
);

export const DELETE = createHandler(
  async (req, { user, params }) => {
    const project = await getProject(params.id);
    if (user.role === 'client' && project.createdBy !== user.uid) {
      throw new ForbiddenError('You do not have access to this project');
    }

    await deleteProject(params.id);
    return NextResponse.json({ success: true });
  },
  { permissions: ['project.manage'] }
);
