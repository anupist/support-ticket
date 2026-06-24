'use client';

import { useEffect, useState } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

interface RelativeTimeProps {
  date: number | Date;
}

export function RelativeTime({ date }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{formatDate(date)}</>;
  }

  return <>{formatDateShort(date)}</>;
}
