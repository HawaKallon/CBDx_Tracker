import { NextResponse } from 'next/server';
import { refreshWorkbookCache } from '@/lib/data/get-program-data';

export async function POST(request: Request) {
  const token = process.env.SYNC_ADMIN_TOKEN;
  if (token) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${token}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const data = await refreshWorkbookCache();
    return NextResponse.json({
      ok: true,
      syncedAt: data.syncedAt,
      source: data.source,
      sheetCount: Object.keys(data.sheets).length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
