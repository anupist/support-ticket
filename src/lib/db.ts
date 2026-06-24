import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type FirestoreError,
  type QueryConstraint,
  type DocumentSnapshot,
  type WithFieldValue,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase-client';
import { DEFAULT_TENANT_ID, COLLECTIONS } from './constants';

function getDb() {
  return getFirestoreDb();
}

export interface QueryOptions {
  tenantId?: string;
  filters?: { field: string; operator: string; value: unknown }[];
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
  limitCount?: number;
  cursor?: DocumentSnapshot;
}

export function collectionRef(path: string, ...segments: string[]) {
  return collection(getDb(), path, ...segments);
}

export function docRef(path: string, ...segments: string[]) {
  return doc(getDb(), path, ...segments);
}

export function buildQuery(
  collectionPath: string,
  options: QueryOptions = {}
) {
  const constraints: QueryConstraint[] = [];
  const tenantId = options.tenantId || DEFAULT_TENANT_ID;

  constraints.push(where('tenantId', '==', tenantId));

  if (options.filters) {
    for (const f of options.filters) {
      constraints.push(where(f.field, f.operator as any, f.value));
    }
  }

  if (options.sorts) {
    for (const s of options.sorts) {
      constraints.push(orderBy(s.field, s.direction));
    }
  }

  if (options.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  if (options.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  return query(collection(getDb(), collectionPath), ...constraints);
}

export interface FirestoreResult<T> {
  data: T[];
  docs: DocumentSnapshot[];
  hasMore: boolean;
}

export async function executeQuery<T>(
  collectionPath: string,
  options: QueryOptions = {}
): Promise<FirestoreResult<T>> {
  const q = buildQuery(collectionPath, options);
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  const limitCount = options.limitCount || 20;
  return {
    data: docs.map((d) => ({ id: d.id, ...d.data() } as T)),
    docs,
    hasMore: docs.length === limitCount,
  };
}

export async function getDocument<T>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  const ref = doc(getDb(), collectionPath, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function createDocument<T extends WithFieldValue<DocumentData>>(
  collectionPath: string,
  data: T
): Promise<string> {
  const ref = collection(getDb(), collectionPath);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(getDb(), collectionPath, docId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionPath: string,
  docId: string
): Promise<void> {
  const ref = doc(getDb(), collectionPath, docId);
  await deleteDoc(ref);
}

export function handleFirestoreError(err: FirestoreError): never {
  throw new Error(`Firestore error (${err.code}): ${err.message}`);
}
