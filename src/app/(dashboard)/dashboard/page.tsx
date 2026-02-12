'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import TopicGrid from '@/components/dashboard/TopicGrid';
import SkillBars from '@/components/dashboard/SkillBars';
import XPBar from '@/components/dashboard/XPBar';
import { Sparkles, Rocket, Loader2 } from 'lucide-react';
import { getTopics, getUserProgress } from '@/lib/firebase/firestore';
import type { Topic, SkillBars as SkillBarsType, UserProgress } from '@/lib/types';

// Topic display config
const topicMeta: Record<string, { emoji: string; color: string }> = {
  variables: { emoji: '📦', color: '#c586c0' },
  'if-else': { emoji: '🔀', color: '#4ec9b0' },
  loops: { emoji: '🔁', color: '#e8925b' },
  functions: { emoji: '⚡', color: '#dcdcaa' },
  arrays: { emoji: '📚', color: '#9cdcfe' },
  objects: { emoji: '🧩', color: '#f472b6' },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<UserProgress>({});
  const [totalXP, setTotalXP] = useState(0);
  const [skillBars, setSkillBars] = useState<SkillBarsType>({
    syntaxFluency: 0,
    patternRecognition: 0,
    debugInstinct: 0,
    creativeThinking: 0,
    builderScore: 0,
  });
  const [displayName, setDisplayName] = useState('Developer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    async function loadData() {
      const [topicsData, userData] = await Promise.all([
        getTopics(),
        getUserProgress(user!.uid),
      ]);
      setTopics(topicsData);
      if (userData) {
        setProgress(userData.progress);
        setTotalXP(userData.totalXP);
        setSkillBars(userData.skillBars);
        setDisplayName(userData.displayName);
      }
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

  const topicCards = topics.map((topic) => {
    const meta = topicMeta[topic.id] || { emoji: '📁', color: '#007acc' };
    const tp = progress[topic.id];
    return {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      levelsCompleted: tp?.levelsCompleted || 0,
      currentLevel: tp?.currentLevel || 1,
      locked: topic.prerequisites.some((pre) => {
        const pp = progress[pre];
        return !pp || pp.levelsCompleted < 5;
      }),
      emoji: meta.emoji,
      color: meta.color,
    };
  });

  const xpLevel = Math.floor(totalXP / 500) + 1;
  const xpForNextLevel = xpLevel * 500;

  return (
    <WorkspaceLayout xp={totalXP} level={xpLevel}>
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Welcome header */}
          <div className="mb-6 p-5 bg-bg-secondary border border-border rounded-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple/5 via-accent/5 to-teal/5 pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="text-3xl">👋</div>
              <div>
                <h1 className="text-base font-mono text-text-bright flex items-center gap-2">
                  Welcome back, {displayName}!
                  <Sparkles size={16} className="text-yellow" />
                </h1>
                <p className="text-[12px] font-mono text-text-secondary mt-0.5">
                  Keep going — every line of code makes you stronger
                </p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-sm">
                <Rocket size={14} className="text-accent" />
                <span className="text-[11px] font-mono text-accent">{totalXP.toLocaleString()} XP earned!</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                  Your Learning Path
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  — {topics.length} topics
                </span>
              </div>
              <TopicGrid topics={topicCards} />
            </div>

            <div className="flex flex-col gap-4">
              <XPBar currentXP={totalXP} nextLevelXP={xpForNextLevel} level={xpLevel} />
              <SkillBars skills={skillBars} />

              <div className="p-3 bg-bg-secondary border border-border rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">💡</span>
                  <span className="text-[11px] font-mono text-yellow uppercase tracking-wider">Tip</span>
                </div>
                <p className="text-[11px] font-mono text-text-secondary leading-relaxed">
                  Solving problems on the first try gives you a 2x score multiplier! But don&apos;t stress — practice makes progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
