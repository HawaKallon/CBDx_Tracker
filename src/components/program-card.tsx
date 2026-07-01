import Link from 'next/link';
import { ExternalLink, BarChart3 } from 'lucide-react';
import type { ProgramConfig } from '@/lib/types';
import type { ProgramSummary } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

type Props = {
  program: ProgramConfig;
  summary?: ProgramSummary | null;
};

export function ProgramCard({ program, summary }: Props) {
  const isExternal = program.type === 'external';
  const href = isExternal ? program.externalUrl ?? '#' : `/programs/${program.slug}`;
  const disabled = program.enabled === false;

  const content = (
  <>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="break-words text-lg font-semibold text-slate-900">{program.name}</h3>
        {program.description ? (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{program.description}</p>
        ) : null}
      </div>
      {isExternal ? (
        <ExternalLink className="h-5 w-5 shrink-0 text-sky-600" aria-hidden />
      ) : (
        <BarChart3 className="h-5 w-5 shrink-0 text-sky-600" aria-hidden />
      )}
    </div>

    {summary && summary.rowCount > 0 ? (
      <div className="mt-4 flex flex-wrap gap-2">
        <KpiChip label="Participants" value={summary.totalParticipants} />
        <KpiChip label="Hubs" value={summary.hubCount} />
        {summary.totalMale + summary.totalFemale > 0 ? (
          <>
            <KpiChip label="Male" value={summary.totalMale} />
            <KpiChip label="Female" value={summary.totalFemale} />
          </>
        ) : null}
      </div>
    ) : !isExternal ? (
      <p className="mt-4 text-sm text-slate-500">No data in workbook yet</p>
    ) : null}

    <p className="mt-4 text-xs font-medium text-sky-700">
      {disabled ? 'Coming soon' : isExternal ? 'Open dashboard →' : 'View program →'}
    </p>
  </>
  );

  const className = cn(
    'block min-w-0 max-w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md sm:p-5',
    disabled && 'opacity-60 pointer-events-none',
  );

  if (disabled) {
    return <div className={className}>{content}</div>;
  }

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function KpiChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900">
      <span className="text-slate-500">{label}</span>
      <span>{value.toLocaleString()}</span>
    </span>
  );
}
