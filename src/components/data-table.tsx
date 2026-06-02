import type { HubRow } from '@/lib/types';

type Props = {
  rows: HubRow[];
  limit?: number;
};

export function DataTable({ rows, limit = 20 }: Props) {
  const display = rows.slice(-limit).reverse();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Month</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Hub</th>
            <th className="px-4 py-2 text-right font-medium text-slate-600">Male</th>
            <th className="px-4 py-2 text-right font-medium text-slate-600">Female</th>
            <th className="px-4 py-2 text-right font-medium text-slate-600">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {display.map((row, i) => (
            <tr key={`${row.hub}-${row.monthLabel}-${i}`}>
              <td className="px-4 py-2 text-slate-700">{row.monthLabel || '—'}</td>
              <td className="px-4 py-2 text-slate-900">{row.hub || '—'}</td>
              <td className="px-4 py-2 text-right text-slate-700">{row.male.toLocaleString()}</td>
              <td className="px-4 py-2 text-right text-slate-700">{row.female.toLocaleString()}</td>
              <td className="px-4 py-2 text-right font-medium text-slate-900">
                {row.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
