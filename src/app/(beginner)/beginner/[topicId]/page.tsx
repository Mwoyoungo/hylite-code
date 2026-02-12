'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import TutorList from '@/components/beginner/TutorList';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';
import { getBeginnerTopic, createBeginnerSession, createCall } from '@/lib/firebase/firestore';
import type { BeginnerTopic } from '@/lib/types';
import Link from 'next/link';

export default function TopicTutorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<BeginnerTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [callingTutor, setCallingTutor] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    async function loadData() {
      const topicData = await getBeginnerTopic(topicId);
      if (!topicData) {
        router.replace('/beginner');
        return;
      }
      setTopic(topicData);
      setLoading(false);
    }

    loadData();
  }, [user, authLoading, router, topicId]);

  const handleCallTutor = useCallback(async (tutorId: string) => {
    if (!user || !profile) return;
    setCallingTutor(tutorId);

    try {
      const roomName = `beginner-${topicId}-${Date.now()}`;
      const liveblocksRoom = `beginner-session-${Date.now()}`;

      // Create session
      const sessionId = await createBeginnerSession({
        studentId: user.uid,
        tutorId,
        topicId,
        livekitRoom: roomName,
        liveblocksRoom,
      });

      // Create call doc for tutor notification
      await createCall({
        studentId: user.uid,
        studentName: profile.displayName,
        tutorId,
        topicId,
        sessionId,
        livekitRoom: roomName,
      });

      // Navigate to session page
      router.push(`/beginner/${topicId}/session/${sessionId}`);
    } catch (err) {
      console.error('Failed to initiate call:', err);
      setCallingTutor(null);
    }
  }, [user, profile, topicId, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!topic || !profile) return null;

  return (
    <WorkspaceLayout xp={profile.totalXP}>
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/beginner"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono text-text-muted hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to topics
          </Link>

          {/* Topic header */}
          <div className="p-5 bg-bg-secondary border border-border rounded-sm mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-teal/15 border border-teal/20">
                <BookOpen size={24} className="text-teal" />
              </div>
              <div>
                <h1 className="text-lg font-mono font-bold text-text-bright">{topic.title}</h1>
                <p className="text-[12px] font-mono text-text-secondary mt-0.5">
                  {topic.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] font-mono text-text-muted">Topics covered:</span>
              {topic.cumulativeTopics.map((t) => (
                <span key={t} className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono rounded-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Tutor list */}
          <div className="mb-3">
            <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-3">
              Choose a Tutor
            </h2>
            <TutorList
              onCallTutor={handleCallTutor}
              callingTutor={callingTutor}
            />
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
