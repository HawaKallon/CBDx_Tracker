import registryJson from '../../../data/programs.json';
import type { ProgramConfig, ProgramsRegistry } from '@/lib/types';

function withDpgUrl(programs: ProgramConfig[]): ProgramConfig[] {
  const dpgUrl = process.env.NEXT_PUBLIC_DPG_TRACKER_URL ?? 'http://localhost:3000';
  return programs.map((p) => {
    if (p.type === 'external' && !p.externalUrl) {
      return { ...p, externalUrl: dpgUrl };
    }
    if (p.externalUrl?.includes('${NEXT_PUBLIC_DPG_TRACKER_URL}')) {
      return { ...p, externalUrl: dpgUrl };
    }
    return p;
  });
}

export function loadProgramsRegistry(): ProgramConfig[] {
  const parsed = registryJson as ProgramsRegistry;
  return withDpgUrl(parsed.programs);
}

export function getProgramBySlug(slug: string): ProgramConfig | undefined {
  return loadProgramsRegistry().find((p) => p.slug === slug);
}

export function listEnabledPrograms(): ProgramConfig[] {
  return loadProgramsRegistry().filter((p) => p.enabled !== false);
}
