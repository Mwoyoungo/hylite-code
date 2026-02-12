'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (loading) return;

    const navigate = (path: string) => {
      setFadingOut(true);
      setTimeout(() => router.replace(path), 400);
    };

    if (!user) {
      navigate('/login');
      return;
    }

    if (!profile) return;

    if (profile.role === 'tutor') {
      navigate('/beginner');
      return;
    }

    if (profile.mode === null) {
      navigate('/mode-select');
    } else if (profile.mode === 'beginner') {
      navigate('/beginner');
    } else {
      navigate('/dashboard');
    }
  }, [user, profile, loading, router]);

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-bg-primary relative"
      style={{
        animation: fadingOut ? 'splash-fade-out 400ms ease-out forwards' : undefined,
      }}
    >
      {/* Gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, var(--teal) 40%, transparent 70%)',
            animation: 'splash-gradient 6s ease infinite',
            backgroundSize: '200% 200%',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, var(--purple) 0%, var(--pink) 40%, transparent 70%)',
            animation: 'splash-gradient 8s ease infinite reverse',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Brand text */}
      <h1
        className="relative font-mono text-4xl font-bold tracking-wider text-text-bright"
        style={{
          animation: 'splash-text-glow 3s ease-in-out infinite',
        }}
      >
        hylite code
      </h1>

      {/* Animated underline */}
      <div className="relative mt-3 w-[200px] h-[2px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--teal), var(--purple))',
            animation: 'splash-underline 1.2s ease-out forwards',
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* Subtle loading text */}
      <p className="relative mt-6 text-[11px] font-mono text-text-muted animate-pulse">
        loading
      </p>
    </div>
  );
}
