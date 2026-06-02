import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const defaultPath = join(root, '..', '..', 'UNICEF', '2025 DLHs Data Tracker.xlsx');
const path = process.env.LOCAL_WORKBOOK_PATH
  ? process.env.LOCAL_WORKBOOK_PATH.startsWith('/')
    ? process.env.LOCAL_WORKBOOK_PATH
    : join(root, process.env.LOCAL_WORKBOOK_PATH)
  : defaultPath;

if (!existsSync(path)) {
  console.error('Workbook not found:', path);
  process.exit(1);
}

const wb = XLSX.read(readFileSync(path), { type: 'buffer', cellDates: true });
console.log('Workbook:', path);
console.log('Sheets:', wb.SheetNames.join(', '));

for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
  const nonEmpty = rows.filter((r) => r.some((c) => c !== '' && c !== null));
  console.log(`  ${name}: ${nonEmpty.length} non-empty rows`);
}
