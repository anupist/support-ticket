'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentData,
} from 'firebase/firestore';

interface UseFirestoreQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestoreQuery<T extends { id: string }>(
  query: Query<DocumentData> | null
): UseFirestoreQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = onSnapshot(
      query,
      (snapshot) => {
        const results = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setData(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [query]);

  return { data, loading, error };
}

export function useFirestoreDocument<T extends { id: string }>(
  query: Query<DocumentData> | null
): UseFirestoreQueryResult<T> {
  return useFirestoreQuery<T>(query);
}
