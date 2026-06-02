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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{item.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
