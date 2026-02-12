'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!profile) return;

    // Tutors always go to beginner dashboard
    if (profile.role === 'tutor') {
      router.replace('/beginner');
      return;
    }

    // Students route based on mode selection
    if (profile.mode === null) {
      router.replace('/mode-select');
    } else if (profile.mode === 'beginner') {
      router.replace('/beginner');
    } else {
      router.replace('/dashboard');
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );
}
