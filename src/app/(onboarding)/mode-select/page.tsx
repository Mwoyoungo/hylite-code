'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ModeSelector from '@/components/beginner/ModeSelector';
import { Loader2 } from 'lucide-react';

export default function ModeSelectPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    // If mode already selected, redirect
    if (profile?.mode) {
      router.replace(profile.mode === 'beginner' ? '/beginner' : '/dashboard');
    }
  }, [user, profile, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return <ModeSelector />;
}
