import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { KpiStrip } from '@/components/kpi-strip';
import { HubBarChart } from '@/components/charts/hub-bar-chart';
import { MonthLineChart } from '@/components/charts/month-line-chart';
import { DataTable } from '@/components/data-table';
import { getProgramBySlug, loadProgramsRegistry } from '@/lib/programs/registry';
import { getProgramSheetData, AVAILABLE_YEARS, normalizeYear } from '@/lib/data/get-program-data';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return loadProgramsRegistry()
    .filter((p) => p.type === 'sheet' && p.enabled !== false)
    .map((p) => ({ slug: p.slug }));
}

export default async function ProgramPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program || program.type !== 'sheet' || !program.sheetName) {
    notFound();
  }

  if (program.enabled === false) {
    notFound();
  }

  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <ProgramHeader searchParams={searchParams} title={program.name} subtitle={program.description} />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<div className="text-sm text-slate-500 animate-pulse">Loading...</div>}>
          <BackLink searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ProgramLoading />}>
          <ProgramDashboardWithYear slug={slug} sheetName={program.sheetName} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function HeaderSkeleton() {
  return (
    <div className="border-b border-sky-800 bg-gradient-to-r from-sky-700 to-sky-900 px-4 py-6 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded bg-sky-600" />
    </div>
  );
}

async function ProgramHeader({ searchParams, title, subtitle }: { searchParams: Promise<Record<string, string | string[] | undefined>>; title: string; subtitle?: string }) {
  const paramData = await searchParams;
  const year = normalizeYear(paramData.year);
  return <SiteHeader title={title} subtitle={subtitle} showBack currentYear={year} availableYears={AVAILABLE_YEARS} />;
}

async function BackLink({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const paramData = await searchParams;
  const year = normalizeYear(paramData.year);
  return (
    <Link href={`/?year=${year}`} className="text-sm font-medium text-sky-700 hover:text-sky-900">
      ← Back to all programs
    </Link>
  );
}

async function ProgramDashboardWithYear({ slug, sheetName, searchParams }: { slug: string; sheetName: string; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const paramData = await searchParams;
  const year = normalizeYear(paramData.year);
  return <ProgramDashboard slug={slug} sheetName={sheetName} year={year} />;
}

async function ProgramDashboard({ slug, sheetName, year }: { slug: string; sheetName: string; year: string }) {
  const program = getProgramBySlug(slug);
  const sheetData = await getProgramSheetData(sheetName, year);
  if (!program) notFound();

  if (!sheetData || sheetData.rows.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-amber-900">No records yet</h2>
        <p className="mt-2 text-sm text-amber-800">
          No records have been entered for this program yet. Check back after the next data update.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 min-w-0 space-y-6 sm:space-y-8">
      <KpiStrip summary={sheetData.summary} />

      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Participants by hub</h2>
        <HubBarChart data={sheetData.byHub} />
      </section>

      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Trend by month</h2>
        <MonthLineChart rows={sheetData.rows} />
      </section>

      <section className="min-w-0">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent records</h2>
        <DataTable rows={sheetData.rows} />
      </section>
    </div>
  );
}

function ProgramLoading() {
  return (
    <div className="mt-8 animate-pulse space-y-4">
      <div className="h-24 rounded-lg bg-slate-200" />
      <div className="h-64 rounded-lg bg-slate-200" />
    </div>
  );
}
