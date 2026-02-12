'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import { GraduationCap, Rocket, Users, Brain, Loader2, ArrowRight } from 'lucide-react';

export default function ModeSelector() {
  const { user } = useAuth();
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);

  const selectMode = async (mode: 'beginner' | 'advanced') => {
    if (!user) return;
    setSelecting(mode);
    try {
      await updateDoc(doc(db, 'quiz_users', user.uid), { mode });
      router.push(mode === 'beginner' ? '/beginner' : '/dashboard');
    } catch {
      setSelecting(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-mono font-bold text-text-bright mb-2">
            Choose Your Path
          </h1>
          <p className="text-[13px] font-mono text-text-secondary">
            Select how you want to learn. You can change this later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Beginner card */}
          <button
            onClick={() => selectMode('beginner')}
            disabled={selecting !== null}
            className="group relative flex flex-col p-6 bg-bg-secondary border border-border hover:border-teal rounded-lg transition-all text-left disabled:opacity-60"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-teal/15 border border-teal/20">
                  <GraduationCap size={24} className="text-teal" />
                </div>
                <div>
                  <h2 className="text-base font-mono font-bold text-text-bright">Beginner</h2>
                  <span className="text-[11px] font-mono text-teal uppercase tracking-wider">Guided Learning</span>
                </div>
              </div>

              <p className="text-[13px] font-mono text-text-secondary mb-4 leading-relaxed">
                Learn with a live human tutor who teaches you concepts through audio calls and a shared code editor, then test your knowledge with adaptive AI quizzes.
              </p>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-[12px] font-mono text-text-secondary">
                  <Users size={14} className="text-teal" />
                  <span>1-on-1 live tutor sessions</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-mono text-text-secondary">
                  <Brain size={14} className="text-teal" />
                  <span>Adaptive 10-question quizzes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[13px] font-mono text-teal group-hover:gap-3 transition-all">
                {selecting === 'beginner' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    Start as Beginner
                    <ArrowRight size={14} />
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Advanced card */}
          <button
            onClick={() => selectMode('advanced')}
            disabled={selecting !== null}
            className="group relative flex flex-col p-6 bg-bg-secondary border border-border hover:border-purple rounded-lg transition-all text-left disabled:opacity-60"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-transparent rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple/15 border border-purple/20">
                  <Rocket size={24} className="text-purple" />
                </div>
                <div>
                  <h2 className="text-base font-mono font-bold text-text-bright">Advanced</h2>
                  <span className="text-[11px] font-mono text-purple uppercase tracking-wider">Quantum Framework</span>
                </div>
              </div>

              <p className="text-[13px] font-mono text-text-secondary mb-4 leading-relaxed">
                Challenge yourself with the 5-level Quantum framework: syntax, multi-path thinking, debugging, constraints, and micro-projects.
              </p>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-[12px] font-mono text-text-secondary">
                  <Brain size={14} className="text-purple" />
                  <span>5 progressive difficulty levels</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-mono text-text-secondary">
                  <Rocket size={14} className="text-purple" />
                  <span>AI tutor with Quantum pedagogy</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[13px] font-mono text-purple group-hover:gap-3 transition-all">
                {selecting === 'advanced' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    Start as Advanced
                    <ArrowRight size={14} />
                  </>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
