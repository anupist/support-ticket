import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { createProject, getProjectsByUser } from '@/lib/services/project.service';
import { createProjectSchema } from '@/lib/validations/project.schema';
import { ValidationError } from '@/lib/errors';

export const GET = createHandler(async (req, { user }) => {
  const projects = user.role === 'client'
    ? await getProjectsByUser(user.tenantId, user.uid)
    : await getProjectsByUser(user.tenantId);

  return NextResponse.json({ projects });
});

export const POST = createHandler(
  async (req, { user }) => {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(parsed.error.errors.map((e) => [e.path.join('.'), [e.message]]))
      );
    }

    const project = await createProject(parsed.data, user.uid);
    return NextResponse.json({ project }, { status: 201 });
  },
  { permissions: ['project.manage'] }
);
