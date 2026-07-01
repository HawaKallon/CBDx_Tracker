import type { ProgramSummary } from '@/lib/types';

type Props = {
  summary: ProgramSummary;
};

export function KpiStrip({ summary }: Props) {
  const items = [
    { label: 'Total participants', value: summary.totalParticipants },
    { label: 'Hubs', value: summary.hubCount },
    { label: 'Male', value: summary.totalMale },
    { label: 'Female', value: summary.totalFemale },
    { label: 'Records', value: summary.rowCount },
  ].filter((item) => item.value > 0 || item.label === 'Total participants');

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{item.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
