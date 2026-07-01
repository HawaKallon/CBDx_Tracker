import 'server-only';

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cacheLife, cacheTag } from 'next/cache';
import { parseWorkbookBuffer } from '@/lib/excel/parse-workbook';
import { fetchWorkbookFromGraph, isGraphConfigured } from '@/lib/excel/graph-client';
import type { ParsedWorkbook, ProgramSheetData } from '@/lib/types';

const WORKBOOKS: Record<string, string> = {
  '2025': '2025 DLHs Data Tracker.xlsx',
  '2026': '2026 DLHs Data Tracker - 2.xlsx',
};

export const AVAILABLE_YEARS = ['2026', '2025'] as const;
export const DEFAULT_YEAR = '2026';

function dataSource(): 'graph' | 'local' {
  const configured = process.env.DATA_SOURCE ?? 'local';
  if (configured === 'graph' && isGraphConfigured()) return 'graph';
  return 'local';
}

function localWorkbookPath(year: string = DEFAULT_YEAR): string {
  const filename = WORKBOOKS[year];
  if (!filename) {
    throw new Error(`Unknown year: ${year}. Available years: ${Object.keys(WORKBOOKS).join(', ')}`);
  }

  return join(/* turbopackIgnore: true */ process.cwd(), 'data', 'UNICEF', filename);
}

async function getWorkbookBytes(year: string = DEFAULT_YEAR): Promise<{ buffer: Buffer; source: 'local' | 'graph' }> {
  const source = year === DEFAULT_YEAR ? dataSource() : 'local';

  if (source === 'graph') {
    try {
      const buffer = await fetchWorkbookFromGraph();
      return { buffer, source: 'graph' };
    } catch (err) {
      console.error('[unicef_hub] Graph fetch failed, falling back to local file:', err);
    }
  }

  const path = localWorkbookPath(year);
  if (!existsSync(path)) {
    throw new Error(`Local workbook not found at ${path}. Place the xlsx in data/UNICEF/.`);
  }
  return { buffer: readFileSync(path), source: 'local' };
}

async function loadParsedWorkbook(year: string = DEFAULT_YEAR): Promise<ParsedWorkbook> {
  const { buffer, source } = await getWorkbookBytes(year);
  return parseWorkbookBuffer(buffer, source);
}

export async function getWorkbookData(year: string = DEFAULT_YEAR): Promise<ParsedWorkbook> {
  'use cache';
  cacheTag('unicef-workbook', `year-${year}`);
  const seconds = Number(process.env.SYNC_REVALIDATE_SECONDS ?? 900);
  cacheLife({ revalidate: seconds });
  return loadParsedWorkbook(year);
}

export async function getProgramSheetData(sheetName: string, year: string = DEFAULT_YEAR): Promise<ProgramSheetData | null> {
  'use cache';
  cacheTag('unicef-workbook', `sheet-${sheetName}-${year}`);
  const wb = await getWorkbookData(year);
  return wb.sheets[sheetName] ?? null;
}

export async function refreshWorkbookCache(): Promise<ParsedWorkbook> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('unicef-workbook', 'max');
  return getWorkbookData();
}
