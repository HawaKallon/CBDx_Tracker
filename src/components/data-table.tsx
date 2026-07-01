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
    <div className="min-w-0 max-w-full">
      <div className="space-y-3 sm:hidden">
        {display.map((row, i) => (
          <article
            key={`${row.hub}-${row.monthLabel}-${i}`}
            className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {row.monthLabel || 'Month not provided'}
                </p>
                <p className="mt-1 break-words font-medium text-slate-900">{row.hub || '—'}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-500">Total</p>
                <p className="font-semibold tabular-nums text-slate-900">
                  {row.total.toLocaleString()}
                </p>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Male</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-700">
                  {formatGenderValue(row, row.male)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Female</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-700">
                  {formatGenderValue(row, row.female)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden w-full max-w-full overflow-x-auto rounded-lg border border-slate-200 sm:block">
        <table className="w-full min-w-[640px] divide-y divide-slate-200 text-sm">
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
                <td className="px-4 py-2 text-right text-slate-700">{formatGenderValue(row, row.male)}</td>
                <td className="px-4 py-2 text-right text-slate-700">{formatGenderValue(row, row.female)}</td>
                <td className="px-4 py-2 text-right font-medium text-slate-900">
                  {row.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={goToPrev}
            disabled={currentPage === 0}
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage >= totalPages - 1}
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function formatGenderValue(row: HubRow, value: number): string {
  const isTotalOnlyRecord = row.total > 0 && row.male === 0 && row.female === 0;
  return isTotalOnlyRecord ? '—' : value.toLocaleString();
}
