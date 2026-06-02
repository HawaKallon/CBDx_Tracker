import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { KpiStrip } from '@/components/kpi-strip';
import { HubBarChart } from '@/components/charts/hub-bar-chart';
import { MonthLineChart } from '@/components/charts/month-line-chart';
import { DataTable } from '@/components/data-table';
import { getProgramBySlug, loadProgramsRegistry } from '@/lib/programs/registry';
import { getProgramSheetData, getWorkbookData } from '@/lib/data/get-program-data';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return loadProgramsRegistry()
    .filter((p) => p.type === 'sheet' && p.enabled !== false)
    .map((p) => ({ slug: p.slug }));
}

export default async function ProgramPage({ params }: Props) {
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
      <SiteHeader title={program.name} subtitle={program.description} showBack />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-900">
          ← Back to all programs
        </Link>
        <Suspense fallback={<ProgramLoading />}>
          <ProgramDashboard slug={slug} sheetName={program.sheetName} />
        </Suspense>
      </main>
    </>
  );
}

async function ProgramDashboard({ slug, sheetName }: { slug: string; sheetName: string }) {
  const program = getProgramBySlug(slug);
  const sheetData = await getProgramSheetData(sheetName);
  const workbook = await getWorkbookData();

  if (!program) notFound();

  if (!sheetData || sheetData.rows.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-amber-900">No data in workbook yet</h2>
        <p className="mt-2 text-sm text-amber-800">
          The sheet &ldquo;{sheetName}&rdquo; has no rows with hub/month data. Add entries in Excel
          Online and wait for the next sync.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <KpiStrip summary={sheetData.summary} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Participants by hub</h2>
        <HubBarChart data={sheetData.byHub} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Trend by month</h2>
        <MonthLineChart rows={sheetData.rows} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent records</h2>
        <DataTable rows={sheetData.rows} />
      </section>

      <footer className="text-sm text-slate-500">
        Sheet: {sheetName} · Synced{' '}
        <time dateTime={workbook.syncedAt}>{new Date(workbook.syncedAt).toLocaleString()}</time>
      </footer>
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
