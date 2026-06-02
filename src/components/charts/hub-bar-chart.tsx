'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HubAggregate } from '@/lib/types';

type Props = {
  data: HubAggregate[];
};

export function HubBarChart({ data }: Props) {
  const chartData = data.slice(0, 12).map((d) => ({
    name: d.hub.length > 18 ? `${d.hub.slice(0, 16)}…` : d.hub,
    fullName: d.hub,
    male: d.male,
    female: d.female,
    total: d.total,
  }));

  if (!chartData.length) {
    return <p className="text-sm text-slate-500">No hub data to chart.</p>;
  }

  return (
    <div className="h-72 min-h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { fullName?: string } | undefined;
              return item?.fullName ?? '';
            }}
          />
          <Legend />
          <Bar dataKey="male" name="Male" fill="#0284c7" stackId="a" />
          <Bar dataKey="female" name="Female" fill="#f472b6" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
