import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './admin';

export interface VerifiedUser {
  uid: string;
  email?: string;
}

/**
 * Extracts and verifies a Firebase ID token from the Authorization header.
 * Returns the decoded user or a NextResponse error.
 */
export async function verifyAuth(
  req: NextRequest
): Promise<VerifiedUser | NextResponse> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 }
    );
  }

  const idToken = authHeader.slice(7);

  let adminAuth;
  try {
    adminAuth = getAdminAuth();
  } catch (err) {
    console.error('Firebase Admin not configured:', err);
    return NextResponse.json(
      { error: 'Auth verification not configured on server' },
      { status: 500 }
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch (err) {
    console.error('Firebase token verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
