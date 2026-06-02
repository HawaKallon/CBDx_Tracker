import 'server-only';

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cacheLife, cacheTag } from 'next/cache';
import { parseWorkbookBuffer } from '@/lib/excel/parse-workbook';
import { fetchWorkbookFromGraph, isGraphConfigured } from '@/lib/excel/graph-client';
import type { ParsedWorkbook, ProgramSheetData } from '@/lib/types';

function dataSource(): 'graph' | 'local' {
  const configured = process.env.DATA_SOURCE ?? 'local';
  if (configured === 'graph' && isGraphConfigured()) return 'graph';
  return 'local';
}

function localWorkbookPath(): string {
  const fromEnv = process.env.LOCAL_WORKBOOK_PATH;
  if (fromEnv) {
    return fromEnv.startsWith('/') ? fromEnv : join(process.cwd(), fromEnv);
  }
  return join(
    /* turbopackIgnore: true */ process.cwd(),
    '..',
    '..',
    'UNICEF',
    '2025 DLHs Data Tracker.xlsx',
  );
}

async function getWorkbookBytes(): Promise<{ buffer: Buffer; source: 'local' | 'graph' }> {
  const source = dataSource();

  if (source === 'graph') {
    try {
      const buffer = await fetchWorkbookFromGraph();
      return { buffer, source: 'graph' };
    } catch (err) {
      console.error('[unicef_hub] Graph fetch failed, falling back to local file:', err);
    }
  }

  const path = localWorkbookPath();
  if (!existsSync(path)) {
    throw new Error(`Local workbook not found at ${path}. Set LOCAL_WORKBOOK_PATH or place the xlsx in UNICEF/.`);
  }
  return { buffer: readFileSync(path), source: 'local' };
}

async function loadParsedWorkbook(): Promise<ParsedWorkbook> {
  const { buffer, source } = await getWorkbookBytes();
  return parseWorkbookBuffer(buffer, source);
}

export async function getWorkbookData(): Promise<ParsedWorkbook> {
  'use cache';
  cacheTag('unicef-workbook');
  const seconds = Number(process.env.SYNC_REVALIDATE_SECONDS ?? 900);
  cacheLife({ revalidate: seconds });
  return loadParsedWorkbook();
}

export async function getProgramSheetData(sheetName: string): Promise<ProgramSheetData | null> {
  'use cache';
  cacheTag('unicef-workbook', `sheet-${sheetName}`);
  const wb = await getWorkbookData();
  return wb.sheets[sheetName] ?? null;
}

export async function refreshWorkbookCache(): Promise<ParsedWorkbook> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('unicef-workbook', 'max');
  return getWorkbookData();
}
