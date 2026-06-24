import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase-client';

function getAuth() {
  return getFirebaseAuth();
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getAuth(), email, password);
  const token = await result.user.getIdToken();
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const result = await createUserWithEmailAndPassword(getAuth(), email, password);
  const token = await result.user.getIdToken();
  await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token, displayName }),
  });
  return result.user;
}

export async function logout() {
  await signOut(getAuth());
  await fetch('/api/auth/session', { method: 'DELETE' });
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(getAuth(), callback);
}
