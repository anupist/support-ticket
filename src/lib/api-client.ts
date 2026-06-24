import { getFirebaseAuth } from './firebase-client';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
