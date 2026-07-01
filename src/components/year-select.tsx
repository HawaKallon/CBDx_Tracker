'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  currentYear: string;
  availableYears: readonly string[];
};

export function YearSelect({ currentYear, availableYears }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <label htmlFor="year-select" className="text-xs font-semibold uppercase tracking-wide text-sky-100">
        Year:
      </label>
      <select
        id="year-select"
        value={currentYear}
        onChange={(e) => handleYearChange(e.target.value)}
        className="min-h-9 rounded-md bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
