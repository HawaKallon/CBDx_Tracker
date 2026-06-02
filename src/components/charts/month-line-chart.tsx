'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HubRow } from '@/lib/types';

type Props = {
  rows: HubRow[];
};

export function MonthLineChart({ rows }: Props) {
  const byMonth = new Map<string, number>();
  for (const r of rows) {
    const key = r.monthLabel || 'Unknown';
    byMonth.set(key, (byMonth.get(key) ?? 0) + r.total);
  }

  const chartData = Array.from(byMonth.entries()).map(([month, total]) => ({
    month,
    total,
  }));

  if (chartData.length < 2) {
    return <p className="text-sm text-slate-500">Not enough monthly data for a trend chart.</p>;
  }

  return (
    <div className="h-64 min-h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Participants']} />
          <Line type="monotone" dataKey="total" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
