import { NextRequest, NextResponse } from 'next/server';

// Beacon endpoint for tutor going offline when they close the tab.
// This just acknowledges the beacon — the actual offline update happens via:
// 1. Component unmount cleanup (client-side, has auth)
// 2. Heartbeat staleness (lastOnlineAt > 30s = stale)
export async function POST(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
