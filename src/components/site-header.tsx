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
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {showBack ? (
              <Link href={currentYear ? `/?year=${currentYear}` : '/'} className="text-xs font-semibold uppercase tracking-widest text-sky-200 hover:text-white">
                ← All programs
              </Link>
            ) : null}
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle ? <p className="text-sm text-sky-100">{subtitle}</p> : null}
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
