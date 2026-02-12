'use client';

import { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';

export default function FixRolePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);

  const setRole = async (role: 'student' | 'tutor') => {
    if (!user) return;
    setUpdating(true);

    try {
      // Update quiz_users doc
      await updateDoc(doc(db, 'quiz_users', user.uid), { role });

      // Create/update tutor_availability if tutor
      if (role === 'tutor') {
        await setDoc(doc(db, 'tutor_availability', user.uid), {
          uid: user.uid,
          displayName: profile?.displayName || user.displayName || 'Tutor',
          photoURL: profile?.photoURL || user.photoURL || null,
          isOnline: false,
          specialties: [],
          inSession: false,
          lastOnlineAt: Date.now(),
        }, { merge: true });
      }

      setDone(true);
      refreshProfile();

      // Redirect after a moment
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update role: ' + (err instanceof Error ? err.message : err));
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <p className="text-text-muted font-mono text-[13px]">Please log in first.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-primary gap-3">
        <CheckCircle size={32} className="text-success" />
        <p className="text-text-primary font-mono text-[14px]">Role updated! Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-primary px-4">
      <h1 className="text-lg font-mono font-bold text-text-bright mb-2">Fix Your Role</h1>
      <p className="text-[12px] font-mono text-text-secondary mb-1">
        Logged in as: <span className="text-accent">{user.email}</span>
      </p>
      <p className="text-[12px] font-mono text-text-muted mb-6">
        Current role: <span className="text-teal">{profile?.role || 'unknown'}</span>
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
        <button
          onClick={() => setRole('student')}
          disabled={updating}
          className="flex flex-col items-center gap-2 p-6 bg-bg-secondary border border-border hover:border-accent rounded transition-colors disabled:opacity-50"
        >
          <GraduationCap size={28} className="text-accent" />
          <span className="text-[13px] font-mono font-semibold text-text-primary">Student</span>
        </button>

        <button
          onClick={() => setRole('tutor')}
          disabled={updating}
          className="flex flex-col items-center gap-2 p-6 bg-bg-secondary border border-border hover:border-teal rounded transition-colors disabled:opacity-50"
        >
          <BookOpen size={28} className="text-teal" />
          <span className="text-[13px] font-mono font-semibold text-text-primary">Tutor</span>
        </button>
      </div>

      {updating && (
        <div className="flex items-center gap-2 mt-4">
          <Loader2 size={14} className="animate-spin text-text-muted" />
          <span className="text-[12px] font-mono text-text-muted">Updating...</span>
        </div>
      )}
    </div>
  );
}
