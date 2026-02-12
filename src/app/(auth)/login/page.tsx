'use client';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Subtle colored orbs in background */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 p-8 bg-bg-secondary border border-border max-w-[420px] w-full mx-4 rounded-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl mb-1">⚡</div>
          <span className="text-lg font-mono text-text-bright">Quantum Quiz AI</span>
          <p className="text-[12px] font-mono text-text-muted text-center">
            Learn JavaScript through AI-guided coding challenges
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
