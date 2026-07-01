import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { ProgramCard } from '@/components/program-card';
import { loadProgramsRegistry } from '@/lib/programs/registry';
import { getWorkbookData, AVAILABLE_YEARS, normalizeYear } from '@/lib/data/get-program-data';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function HomePage({ searchParams }: Props) {
  const programs = loadProgramsRegistry();

  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <HomeHeader searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<HomeLoading />}>
          <HomeContent programs={programs} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function HomeHeader({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const year = normalizeYear(params.year);
  return <SiteHeader currentYear={year} availableYears={AVAILABLE_YEARS} />;
}

async function HomeContent({ programs, searchParams }: { programs: ReturnType<typeof loadProgramsRegistry>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const year = normalizeYear(params.year);
  const workbook = await getWorkbookData(year);

  // Combine every enabled sheet-backed program into a single portfolio total.
  // DPG lives on a separate site and is intentionally excluded for now.
  const contributing = programs.filter(
    (p) =>
      p.type === 'sheet' &&
      p.enabled !== false &&
      p.sheetName &&
      (workbook.sheets[p.sheetName]?.summary.rowCount ?? 0) > 0,
  );

  const portfolio = contributing.reduce(
    (acc, p) => {
      const s = workbook.sheets[p.sheetName!]!.summary;
      acc.totalParticipants += s.totalParticipants;
      acc.totalMale += s.totalMale;
      acc.totalFemale += s.totalFemale;
      return acc;
    },
    { totalParticipants: 0, totalMale: 0, totalFemale: 0 },
  );

  const contributingNames = contributing.map((p) => p.name).join(', ');

  return (
    <>
      {contributing.length > 0 ? (
        <section className="mb-8 rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800">
            Portfolio overview
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Combined across {contributingNames}. Excludes DPG (tracked separately).
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Participants" value={portfolio.totalParticipants} />
            <Stat label="Programs" value={contributing.length} />
            <Stat label="Male" value={portfolio.totalMale} />
            <Stat label="Female" value={portfolio.totalFemale} />
          </dl>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Programs & activities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const sheetData =
              program.type === 'sheet' && program.sheetName
                ? workbook.sheets[program.sheetName]
                : null;
            return (
              <ProgramCard
                key={program.slug}
                program={program}
                summary={sheetData?.summary ?? null}
              />
            );
          })}
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          Data last synced:{' '}
          <time dateTime={workbook.syncedAt}>
            {new Date(workbook.syncedAt).toLocaleString()}
          </time>{' '}
          · Source: {workbook.source === 'graph' ? 'Excel Online (Microsoft Graph)' : 'local workbook'}
        </p>
        <p className="mt-1">
          Cache refreshes every {Number(process.env.SYNC_REVALIDATE_SECONDS ?? 900) / 60} minutes.
        </p>
      </footer>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-slate-900">{value.toLocaleString()}</dd>
    </div>
  );
}

function SiteHeaderSkeleton() {
  return (
    <div className="border-b border-sky-800 bg-gradient-to-r from-sky-700 to-sky-900 px-4 py-6 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded bg-sky-600" />
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 rounded-xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
