export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'not_found', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, 'forbidden', message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'unauthorized', message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends AppError {
  public fields: Record<string, string[]>;

  constructor(fields: Record<string, string[]>) {
    super(400, 'validation_error', 'Validation failed');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'conflict', message);
    this.name = 'ConflictError';
  }
}

export function handleApiError(err: unknown): Response {
  if (err instanceof AppError) {
    return Response.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err instanceof ValidationError && { fields: err.fields }),
        },
      },
      { status: err.statusCode }
    );
  }

  console.error('Unhandled error:', err);
  return Response.json(
    { error: { code: 'internal_error', message: 'An unexpected error occurred' } },
    { status: 500 }
  );
}
