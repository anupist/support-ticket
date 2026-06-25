'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: '#f59e0b' },
  in_progress: { label: 'In Progress', color: '#3b82f6' },
  resolved: { label: 'Resolved', color: '#16a34a' },
  closed: { label: 'Closed', color: '#6b7280' },
};

export function StatusDonutChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets/stats/status')
      .then((r) => r.json())
      .then((d) => { setData(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-48 w-full" />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground text-center py-12">No data</p>;

  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
            {data.map((entry: any) => (
              <Cell key={entry.name} fill={STATUS_CONFIG[entry.name]?.color || '#94a3b8'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 text-sm">
        {data.map((entry: any) => {
          const cfg = STATUS_CONFIG[entry.name];
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg?.color || '#94a3b8' }} />
              <span className="text-muted-foreground min-w-[80px]">{cfg?.label || entry.name}</span>
              <span className="font-medium tabular-nums">{entry.value}</span>
              <span className="text-xs text-muted-foreground tabular-nums">({Math.round((entry.value / total) * 100)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}