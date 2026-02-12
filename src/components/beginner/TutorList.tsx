'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import TutorCard from './TutorCard';
import { Loader2, Users } from 'lucide-react';
import type { TutorAvailability } from '@/lib/types';

interface TutorListProps {
  onCallTutor: (tutorId: string) => void;
  callingTutor?: string | null;
}

export default function TutorList({ onCallTutor, callingTutor }: TutorListProps) {
  const [tutors, setTutors] = useState<TutorAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'tutor_availability'),
      where('isOnline', '==', true)
    );

    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const list = snap.docs
        .map((d) => ({ uid: d.id, ...d.data() } as TutorAvailability))
        // Filter out stale tutors (no heartbeat in 60s)
        .filter((t) => !t.lastOnlineAt || now - t.lastOnlineAt < 60_000);
      setTutors(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Users size={32} className="text-text-muted mb-3" />
        <p className="text-[14px] font-mono text-text-secondary text-center">No tutors online right now</p>
        <p className="text-[12px] font-mono text-text-muted text-center mt-1">
          Check back in a few minutes — tutors come and go throughout the day
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-[12px] font-mono text-text-secondary">
          {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} online
        </span>
      </div>
      {tutors.map((tutor) => (
        <TutorCard
          key={tutor.uid}
          tutor={tutor}
          onCall={onCallTutor}
          disabled={!!callingTutor}
        />
      ))}
    </div>
  );
}
