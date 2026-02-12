import { NextRequest, NextResponse } from 'next/server';
import { Liveblocks } from '@liveblocks/node';
import { verifyAuth } from '@/lib/firebase/verify-auth';

let _liveblocks: Liveblocks | null = null;

function getLiveblocks(): Liveblocks {
  if (!_liveblocks) {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) {
      throw new Error('LIVEBLOCKS_SECRET_KEY is not configured');
    }
    _liveblocks = new Liveblocks({ secret });
  }
  return _liveblocks;
}

export async function POST(req: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { userId, userName, roomId } = await req.json();

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure userId matches authenticated user
    if (userId !== authResult.uid) {
      return NextResponse.json(
        { error: 'User ID does not match authenticated user' },
        { status: 403 }
      );
    }

    let liveblocks;
    try {
      liveblocks = getLiveblocks();
    } catch {
      return NextResponse.json(
        { error: 'LIVEBLOCKS_SECRET_KEY is not configured' },
        { status: 500 }
      );
    }

    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: userName || 'Anonymous',
      },
    });

    session.allow(roomId, session.FULL_ACCESS);

    const { body, status } = await session.authorize();
    return new Response(body, { status });
  } catch (error) {
    console.error('Liveblocks auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authorize' },
      { status: 500 }
    );
  }
}
