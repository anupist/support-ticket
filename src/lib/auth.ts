import { scryptSync, randomUUID, timingSafeEqual } from 'crypto';

const SESSION_EXPIRY_MS = 5 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const derived = scryptSync(password, salt, 64).toString('hex');
  if (derived.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(derived), Buffer.from(hash));
}

export function generateSessionToken(): string {
  return randomUUID();
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_EXPIRY_MS);
}

export { SESSION_EXPIRY_MS };
