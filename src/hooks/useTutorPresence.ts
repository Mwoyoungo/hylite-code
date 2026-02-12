'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateTutorAvailability } from '@/lib/firebase/firestore';

export function useTutorPresence() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || profile?.role !== 'tutor') return;

    const uid = user.uid;

    // Go online — include defaults so the doc is valid even if created fresh via merge
    updateTutorAvailability(uid, {
      uid,
      displayName: profile.displayName || 'Tutor',
      photoURL: profile.photoURL || null,
      isOnline: true,
      inSession: false,
      specialties: [],
      lastOnlineAt: Date.now(),
    });

    // Heartbeat — update lastOnlineAt every 30s so stale entries can be detected
    const heartbeat = setInterval(() => {
      updateTutorAvailability(uid, { lastOnlineAt: Date.now() });
    }, 30_000);

    // Go offline on page close
    const handleUnload = () => {
      // sendBeacon is the only reliable way to fire during tab close
      navigator.sendBeacon(`/api/tutor/offline?uid=${uid}`);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleUnload);
      updateTutorAvailability(uid, { isOnline: false });
    };
  }, [user, profile?.role]);
}
