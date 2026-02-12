'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import BeginnerTopicList from '@/components/beginner/BeginnerTopicList';
import XPBar from '@/components/dashboard/XPBar';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import { getBeginnerTopics } from '@/lib/firebase/firestore';
import type { BeginnerTopic } from '@/lib/types';

export default function BeginnerDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<BeginnerTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    async function loadData() {
      const topicsData = await getBeginnerTopics();
      setTopics(topicsData);
      setLoading(false);
    }

    loadData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) return null;

  const totalXP = profile.totalXP;
  const xpLevel = Math.floor(totalXP / 500) + 1;
  const xpForNextLevel = xpLevel * 500;
  const isTutor = profile.role === 'tutor';
  const completedCount = Object.values(profile.beginnerProgress).filter((p) => p.completed).length;

  return (
    <WorkspaceLayout xp={totalXP} level={xpLevel}>
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Welcome header */}
          <div className="mb-6 p-5 bg-bg-secondary border border-border rounded-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-accent/5 to-purple/5 pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="text-3xl">{isTutor ? '📖' : '👋'}</div>
              <div>
                <h1 className="text-base font-mono text-text-bright flex items-center gap-2">
                  {isTutor ? `Tutor Dashboard` : `Welcome back, ${profile.displayName}!`}
                  <Sparkles size={16} className="text-yellow" />
                </h1>
                <p className="text-[12px] font-mono text-text-secondary mt-0.5">
                  {isTutor
                    ? 'You are online and ready to receive student calls'
                    : `${completedCount} of ${topics.length} topics completed`}
                </p>
              </div>
              {isTutor && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-teal/10 border border-teal/20 rounded-sm">
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  <span className="text-[11px] font-mono text-teal">Online</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
            {/* Topic list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-teal" />
                <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                  {isTutor ? 'Teaching Topics' : 'Learning Path'}
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  — {topics.length} topics
                </span>
              </div>
              <BeginnerTopicList
                topics={topics}
                beginnerProgress={profile.beginnerProgress}
              />
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <XPBar currentXP={totalXP} nextLevelXP={xpForNextLevel} level={xpLevel} />

              <div className="p-3 bg-bg-secondary border border-border rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">💡</span>
                  <span className="text-[11px] font-mono text-yellow uppercase tracking-wider">How it works</span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] font-mono text-text-secondary leading-relaxed">
                  <p>1. Pick a topic and call an online tutor</p>
                  <p>2. Learn through audio + shared code editor</p>
                  <p>3. Take a 10-question adaptive AI quiz</p>
                  <p>4. Pass to unlock the next topic!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
