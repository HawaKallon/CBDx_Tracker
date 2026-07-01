'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { YearSelect } from '@/components/year-select';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  currentYear?: string;
  availableYears?: readonly string[];
};

export function SiteHeader({
  title = 'UNICEF Sierra Leone',
  subtitle = 'Digital Learning Hubs — Program Hub',
  showBack = false,
  currentYear,
  availableYears,
}: Props) {
  return (
    <header className="border-b border-sky-800 bg-gradient-to-r from-sky-700 to-sky-900 text-white">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-1 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:justify-between">
          <div className="min-w-0 max-w-full">
            {showBack ? (
              <Link href={currentYear ? `/?year=${currentYear}` : '/'} className="text-xs font-semibold uppercase tracking-widest text-sky-200 hover:text-white">
                ← All programs
              </Link>
            ) : null}
            <h1 className="break-words text-xl font-bold sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 break-words text-sm text-sky-100">{subtitle}</p> : null}
          </div>
          <Suspense fallback={<YearSelectSkeleton />}>
            {currentYear && availableYears ? <YearSelect currentYear={currentYear} availableYears={availableYears} /> : null}
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function YearSelectSkeleton() {
  return <div className="h-8 w-32 animate-pulse rounded bg-sky-600" />;
}
