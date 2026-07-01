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
  const chartData = data.slice(0, 12).map((d) => {
    const hasGenderData = d.male !== 0 || d.female !== 0;

    return {
      name: d.hub.length > 18 ? `${d.hub.slice(0, 16)}…` : d.hub,
      fullName: d.hub,
      male: hasGenderData ? d.male : null,
      female: hasGenderData ? d.female : null,
      totalOnly: !hasGenderData && d.total > 0 ? d.total : null,
    };
  });

  const hasTotalOnlyData = chartData.some((d) => d.totalOnly !== null);

  if (!chartData.length) {
    return <p className="text-sm text-slate-500">No hub data to chart.</p>;
  }

  return (
    <div className="h-80 min-h-80 w-full min-w-0 max-w-full overflow-hidden sm:h-96 sm:min-h-96">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 72 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-40} textAnchor="end" height={72} />
          <YAxis tick={{ fontSize: 10 }} width={48} />
          <Tooltip
            cursor={false}
            formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { fullName?: string } | undefined;
              return item?.fullName ?? '';
            }}
          />
          <Legend />
          <Bar dataKey="male" name="Male" fill="#0284c7" stackId="a" />
          <Bar dataKey="female" name="Female" fill="#f472b6" stackId="a" />
          {hasTotalOnlyData ? (
            <Bar dataKey="totalOnly" name="Total" fill="#0f766e" stackId="a" />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
