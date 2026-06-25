'use client';

import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';

const RANGE_OPTIONS = [7, 15, 30] as const;

interface TicketTrendChartProps {
  defaultDays?: number;
}

export function TicketTrendChart({ defaultDays = 15 }: TicketTrendChartProps) {
  const [days, setDays] = useState(defaultDays);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/stats/trend?days=${d}`);
      const json = await res.json();
      setData(json.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  function handleRangeChange(d: number) {
    setDays(d);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {RANGE_OPTIONS.map((d) => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeChange(d)}
          >
            {d}d
          </Button>
        ))}
      </div>
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => {
              const parts = v.split('-');
              return `${parts[1]}/${parts[2]}`;
            }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
              labelFormatter={(v) => {
                const parts = v.split('-');
                return `${parts[1]}/${parts[2]}/${parts[0]}`;
              }}
            />
            <Area type="monotone" dataKey="count" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}