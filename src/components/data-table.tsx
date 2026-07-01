'use client';

import { useState } from 'react';
import type { HubRow } from '@/lib/types';

const PAGE_SIZE = 20;

type Props = {
  rows: HubRow[];
};

export function DataTable({ rows }: Props) {
  const [page, setPage] = useState(0);

  const ordered = [...rows].reverse();
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const display = ordered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const goToPrev = () => setPage((p) => Math.max(0, p - 1));
  const goToNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div>
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

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={goToPrev}
            disabled={currentPage === 0}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage >= totalPages - 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
