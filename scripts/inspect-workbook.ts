import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { parseWorkbookBuffer } from '../src/lib/excel/parse-workbook';

config({ path: join(process.cwd(), '.env.local') });

const defaultPath = join(process.cwd(), '..', '..', 'UNICEF', '2025 DLHs Data Tracker.xlsx');
const path = process.env.LOCAL_WORKBOOK_PATH
  ? process.env.LOCAL_WORKBOOK_PATH.startsWith('/')
    ? process.env.LOCAL_WORKBOOK_PATH
    : join(process.cwd(), process.env.LOCAL_WORKBOOK_PATH)
  : defaultPath;

if (!existsSync(path)) {
  console.error('Workbook not found:', path);
  process.exit(1);
}

const buffer = readFileSync(path);
const parsed = parseWorkbookBuffer(buffer, 'local');

console.log('Workbook:', path);
console.log('Parsed sheets:', Object.keys(parsed.sheets).join(', ') || '(none)');
console.log('---');

for (const [name, sheet] of Object.entries(parsed.sheets)) {
  console.log(`\n${name}`);
  console.log(
    `  rows=${sheet.summary.rowCount} hubs=${sheet.summary.hubCount} participants=${sheet.summary.totalParticipants}`,
  );
  if (sheet.rows[0]) {
    console.log('  sample:', JSON.stringify(sheet.rows[0]));
  }
}
