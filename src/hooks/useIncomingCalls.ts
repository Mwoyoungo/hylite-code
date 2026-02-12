'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { CallDocument } from '@/lib/types';

export function useIncomingCalls(tutorId: string | undefined) {
  const [incomingCalls, setIncomingCalls] = useState<CallDocument[]>([]);

  useEffect(() => {
    if (!tutorId) return;

    const q = query(
      collection(db, 'calls'),
      where('tutorId', '==', tutorId),
      where('status', '==', 'ringing')
    );

    const unsub = onSnapshot(q, (snap) => {
      const calls = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CallDocument));
      setIncomingCalls(calls);
    });

    return unsub;
  }, [tutorId]);

  return incomingCalls;
}
