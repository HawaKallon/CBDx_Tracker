import * as XLSX from 'xlsx';
import type { HubAggregate, HubRow, ParsedWorkbook, ProgramSheetData } from '@/lib/types';

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeHeader(h: unknown): string {
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function monthLabel(v: unknown): string {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number' && v > 20000) {
    const parsed = XLSX.SSF.parse_date_code(v);
    if (parsed) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[parsed.m - 1] ?? parsed.m} ${parsed.y}`;
    }
  }
  if (v instanceof Date) {
    return v.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return String(v).trim();
}

function findHeaderRow(rows: unknown[][]): { index: number; map: Record<string, number> } | null {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    if (!row) continue;
    const map: Record<string, number> = {};
    row.forEach((cell, col) => {
      const key = normalizeHeader(cell);
      if (key) map[key] = col;
    });
    if ('hub' in map || 'month' in map || 'date' in map) {
      return { index: i, map };
    }
  }
  return null;
}

function isSummaryLabel(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'total' || v === 'grand total' || v === 'subtotal' || v === 'sum' || v === 'all';
}

function col(map: Record<string, number>, ...names: string[]): number | undefined {
  for (const name of names) {
    const idx = map[name];
    if (idx !== undefined) return idx;
  }
  return undefined;
}

function parseSheet(sheetName: string, ws: XLSX.WorkSheet): ProgramSheetData | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }) as unknown[][];
  if (!rows.length) return null;

  const header = findHeaderRow(rows);
  if (!header) return null;

  const monthCol = col(header.map, 'month');
  const dateCol = col(header.map, 'date');
  const hubCol = col(header.map, 'hub');
  const maleCol = col(header.map, 'male');
  const femaleCol = col(header.map, 'female');
  const totalCol = col(header.map, 'total users', 'total', 'total participants');
  const descCol = col(header.map, 'description', 'activity', 'activity description');
  const movCol = col(header.map, 'mov', 'means of verification');

  const dataRows: HubRow[] = [];

  for (let i = header.index + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const month =
      monthCol !== undefined
        ? monthLabel(row[monthCol])
        : dateCol !== undefined
          ? monthLabel(row[dateCol])
          : '';

    // When a sheet has no Hub column (e.g. advocacy activities keyed by Date/Description),
    // fall back to the description, then the means-of-verification, as the grouping dimension.
    let hub = hubCol !== undefined ? String(row[hubCol] ?? '').trim() : '';
    if (!hub && hubCol === undefined) {
      hub =
        (descCol !== undefined ? String(row[descCol] ?? '').trim() : '') ||
        (movCol !== undefined ? String(row[movCol] ?? '').trim() : '');
    }

    // Skip summary/total rows so they don't double-count, in two forms:
    // 1. A labelled total (e.g. a "TOTAL" hub/description cell).
    // 2. A trailing totals row that leaves its key column(s) blank — when the sheet has a
    //    hub or month/date column, a real row must fill at least one of them; a row with all
    //    of them blank but numbers present is the spreadsheet's own sum.
    if (isSummaryLabel(hub)) continue;
    const hasKeyColumn = hubCol !== undefined || monthCol !== undefined || dateCol !== undefined;
    if (hasKeyColumn && !hub && !month) continue;

    // Skip rows where Male, Female, and Total are all blank (no data entered yet).
    // This catches placeholder months like DSTI May–Dec 2026 where Male/Female are blank
    // and Total is a formula =Male+Female that evaluates to 0.
    // Preserve a genuinely written 0 total *only if* Male or Female also has a value.
    const isBlankCell = (v: unknown) => v === '' || v === null || v === undefined;
    const rawMale = maleCol !== undefined ? row[maleCol] : undefined;
    const rawFemale = femaleCol !== undefined ? row[femaleCol] : undefined;
    const rawTotal = totalCol !== undefined ? row[totalCol] : undefined;
    const totalIsEmptyish = isBlankCell(rawTotal) || (toNum(rawTotal) === 0 && isBlankCell(rawMale) && isBlankCell(rawFemale));
    if (isBlankCell(rawMale) && isBlankCell(rawFemale) && totalIsEmptyish) continue;

    const male = maleCol !== undefined ? toNum(row[maleCol]) : 0;
    const female = femaleCol !== undefined ? toNum(row[femaleCol]) : 0;
    let total = totalCol !== undefined ? toNum(row[totalCol]) : 0;
    if (!total && (male || female)) total = male + female;

    if (!hub && !month && !total) continue;

    const extras: Record<string, string | number> = {};
    Object.entries(header.map).forEach(([key, colIdx]) => {
      if (
        ['month', 'date', 'hub', 'male', 'female', 'total users', 'total', 'description', 'mov'].includes(
          key,
        )
      )
        return;
      const val = row[colIdx];
      if (val !== '' && val !== null && val !== undefined) {
        extras[key] = typeof val === 'number' ? val : String(val);
      }
    });

    dataRows.push({
      monthLabel: month,
      hub,
      male,
      female,
      total,
      description: descCol !== undefined ? String(row[descCol] ?? '').trim() || undefined : undefined,
      extras,
    });
  }

  if (!dataRows.length) return null;

  const byHubMap = new Map<string, HubAggregate>();
  for (const r of dataRows) {
    const key = r.hub || 'Unknown';
    const existing = byHubMap.get(key) ?? { hub: key, male: 0, female: 0, total: 0 };
    existing.male += r.male;
    existing.female += r.female;
    existing.total += r.total;
    byHubMap.set(key, existing);
  }

  const summary = {
    totalMale: dataRows.reduce((s, r) => s + r.male, 0),
    totalFemale: dataRows.reduce((s, r) => s + r.female, 0),
    totalParticipants: dataRows.reduce((s, r) => s + r.total, 0),
    hubCount: byHubMap.size,
    rowCount: dataRows.length,
  };

  return {
    sheetName,
    rows: dataRows,
    summary,
    byHub: Array.from(byHubMap.values()).sort((a, b) => b.total - a.total),
  };
}

export function parseWorkbookBuffer(
  buffer: Buffer,
  source: 'local' | 'graph' = 'local',
): ParsedWorkbook {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheets: Record<string, ProgramSheetData> = {};

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const parsed = parseSheet(sheetName, ws);
    if (parsed) sheets[sheetName] = parsed;
  }

  return {
    sheets,
    syncedAt: new Date().toISOString(),
    source,
  };
}
