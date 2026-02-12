'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import SplitPanel from '@/components/quiz/SplitPanel';
import ChatPanel from '@/components/quiz/ChatPanel';
import AudioCallBar from '@/components/call/AudioCallBar';
import CallingOverlay from '@/components/call/CallingOverlay';
import CollaborativeCodeEditor from '@/components/collab/CollaborativeCodeEditor';
import BeginnerEditorPanel from '@/components/beginner/BeginnerEditorPanel';
import BeginnerTopicCompleteOverlay from '@/components/beginner/BeginnerTopicCompleteOverlay';
import { useCallState } from '@/hooks/useCallState';
import { useLiveKit } from '@/hooks/useLiveKit';
import { useBeginnerQuiz } from '@/hooks/useBeginnerQuiz';
import {
  getBeginnerTopic,
  getBeginnerSession,
  updateBeginnerSession,
  completeBeginnerTopic,
} from '@/lib/firebase/firestore';
import { Loader2, Rocket, AlertTriangle } from 'lucide-react';
import type { BeginnerSession, BeginnerTopic, CallDocument, ChatMessage } from '@/lib/types';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const topicId = params.topicId as string;
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<BeginnerSession | null>(null);
  const [topic, setTopic] = useState<BeginnerTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [callId, setCallId] = useState<string | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const isTutor = profile?.role === 'tutor';
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
  const livekitConfigured = !!livekitUrl;

  // ─── Load session + topic ─────────────────────────
  useEffect(() => {
    if (authLoading || !user) return;

    async function load() {
      const [sessionData, topicData] = await Promise.all([
        getBeginnerSession(sessionId),
        getBeginnerTopic(topicId),
      ]);

      if (!sessionData || !topicData) {
        router.replace('/beginner');
        return;
      }

      setSession(sessionData);
      setTopic(topicData);
      setLoading(false);
    }

    load();
  }, [authLoading, user, sessionId, topicId, router]);

  // ─── Listen for session status changes ──────────────
  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSnapshot(doc(db, 'beginner_sessions', sessionId), (snap) => {
      if (snap.exists()) {
        setSession({ id: snap.id, ...snap.data() } as BeginnerSession);
      }
    });

    return unsub;
  }, [sessionId]);

  // ─── Find the call doc for this session ────────────
  useEffect(() => {
    if (!sessionId || !user) return;

    const q = query(collection(db, 'calls'), where('sessionId', '==', sessionId));
    const unsub = onSnapshot(q, (querySnap) => {
      if (!querySnap.empty) {
        setCallId(querySnap.docs[0].id);
      }
    });

    return unsub;
  }, [sessionId, user]);

  // ─── Call state ─────────────────────────────────────
  const handleCallAccepted = useCallback(async () => {
    if (!user || !session) return;

    // Skip LiveKit token if not configured
    if (!livekitConfigured) {
      console.log('LiveKit not configured — skipping audio connection');
      return;
    }

    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: session.livekitRoom,
          participantName: profile?.displayName || 'User',
          participantIdentity: user.uid,
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.error('LiveKit token error:', data.error);
        return;
      }
      setLivekitToken(data.token);
    } catch (err) {
      console.error('Failed to get LiveKit token:', err);
    }
  }, [user, session, profile?.displayName, livekitConfigured]);

  const handleCallDeclined = useCallback(() => {
    router.replace(`/beginner/${topicId}`);
  }, [router, topicId]);

  const handleCallMissed = useCallback(() => {
    // Stay on page, CallingOverlay will show missed state
  }, []);

  const { callStatus, cancelCall } = useCallState({
    callId,
    onAccepted: handleCallAccepted,
    onDeclined: handleCallDeclined,
    onMissed: handleCallMissed,
  });

  // ─── LiveKit audio ──────────────────────────────────
  const {
    connected: lkConnected,
    isMuted,
    connect: lkConnect,
    disconnect: lkDisconnect,
    toggleMute,
  } = useLiveKit({
    url: livekitUrl,
    token: livekitToken,
    autoConnect: true,
  });

  const handleEndCall = useCallback(() => {
    lkDisconnect();
  }, [lkDisconnect]);

  // ─── Tutor: Start quiz ─────────────────────────────
  const handleStartQuiz = useCallback(async () => {
    await updateBeginnerSession(sessionId, { status: 'quiz' });
  }, [sessionId]);

  // ─── Quiz ───────────────────────────────────────────
  const handleQuizComplete = useCallback(async (correctCount: number) => {
    if (!user) return;
    setFinalScore(correctCount);

    try {
      const earned = await completeBeginnerTopic(user.uid, topicId, correctCount, sessionId);
      setXpEarned(earned);
    } catch (err) {
      console.error('Failed to save completion:', err);
      setXpEarned(correctCount * 10);
    }

    // Disconnect call if still connected
    lkDisconnect();
    setQuizComplete(true);
  }, [user, topicId, sessionId, lkDisconnect]);

  const quiz = useBeginnerQuiz({
    sessionId,
    topicId,
    topicTitle: topic?.title || '',
    cumulativeTopics: topic?.cumulativeTopics || [],
    onComplete: handleQuizComplete,
  });

  // Auto-fetch first question when quiz starts
  const quizStarted = useRef(false);
  useEffect(() => {
    if (session?.status === 'quiz' && !quizStarted.current && !isTutor) {
      quizStarted.current = true;
      quiz.fetchQuestion();
    }
  }, [session?.status, isTutor, quiz.fetchQuestion]);

  // Auto-fetch next question when questionIndex changes
  const prevIndex = useRef(0);
  useEffect(() => {
    if (quiz.questionIndex !== prevIndex.current && session?.status === 'quiz' && !isTutor) {
      prevIndex.current = quiz.questionIndex;
      quiz.fetchQuestion();
    }
  }, [quiz.questionIndex, session?.status, isTutor, quiz.fetchQuestion]);

  // ─── Chat (teaching phase) ─────────────────────────
  const handleSendMessage = useCallback(async (content: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  // ─── Cancel / go back ──────────────────────────────
  const handleCancelCall = useCallback(async () => {
    await cancelCall();
    router.replace(`/beginner/${topicId}`);
  }, [cancelCall, router, topicId]);

  const handleNextTopic = useCallback(() => {
    router.push('/beginner');
  }, [router]);

  const handleDashboard = useCallback(() => {
    router.push('/beginner');
  }, [router]);

  // ─── Loading ────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session || !topic || !profile) return null;

  const otherParticipantName = isTutor
    ? 'Student'
    : profile.displayName || 'Tutor';

  // ─── CALLING PHASE ──────────────────────────────────
  if (session.status === 'calling' && !isTutor) {
    return (
      <CallingOverlay
        tutorName="Tutor"
        topicName={topic.title}
        onCancel={handleCancelCall}
        status={callStatus}
      />
    );
  }

  // ─── TEACHING PHASE ─────────────────────────────────
  if (session.status === 'teaching') {
    return (
      <WorkspaceLayout topicName={topic.title} levelName="Teaching" xp={profile.totalXP}>
        <div className="flex flex-col h-full">
          {/* Audio call bar or notice */}
          {lkConnected ? (
            <AudioCallBar
              participantName={otherParticipantName}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onEndCall={handleEndCall}
              connected={lkConnected}
            />
          ) : !livekitConfigured ? (
            <div className="flex items-center gap-2 h-[40px] px-4 bg-yellow-500/10 border-b border-yellow-500/20 flex-shrink-0">
              <AlertTriangle size={14} className="text-yellow-500" />
              <span className="text-[12px] font-mono text-yellow-500">
                Audio not configured — use an external voice call. Set LIVEKIT env vars to enable.
              </span>
            </div>
          ) : null}

          <SplitPanel
            left={
              <div className="flex flex-col h-full">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={false}
                />
                {/* Tutor: Start Quiz button */}
                {isTutor && (
                  <div className="p-3 border-t border-border bg-bg-secondary">
                    <button
                      onClick={handleStartQuiz}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-mono rounded transition-colors"
                    >
                      <Rocket size={14} />
                      Start Quiz
                    </button>
                  </div>
                )}
              </div>
            }
            right={
              <div className="h-full">
                <CollaborativeCodeEditor
                  roomId={session.liveblocksRoom}
                  userId={user!.uid}
                  userName={profile.displayName}
                />
              </div>
            }
          />
        </div>
      </WorkspaceLayout>
    );
  }

  // ─── QUIZ PHASE ─────────────────────────────────────
  if (session.status === 'quiz') {
    // Tutor sees a waiting screen
    if (isTutor) {
      return (
        <WorkspaceLayout topicName={topic.title} levelName="Quiz in Progress" xp={profile.totalXP}>
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-lg font-mono font-bold text-text-bright mb-2">Student is taking the quiz</h2>
            <p className="text-[13px] font-mono text-text-secondary text-center max-w-md">
              The student is now completing their adaptive 10-question quiz. You can close this page or wait for them to finish.
            </p>
          </div>
        </WorkspaceLayout>
      );
    }

    // Student quiz UI
    return (
      <>
        <WorkspaceLayout topicName={topic.title} levelName="Quiz" xp={profile.totalXP}>
          {quiz.isLoadingQuestion ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin text-accent mb-3" />
              <span className="text-[13px] font-mono text-text-muted">Generating question...</span>
            </div>
          ) : quiz.currentQuestion ? (
            <SplitPanel
              left={
                <div className="flex flex-col h-full bg-bg-secondary">
                  {/* AI feedback area */}
                  <div className="flex items-center gap-2 h-[38px] px-3 border-b border-border bg-bg-tertiary flex-shrink-0">
                    <span className="text-base">🤖</span>
                    <span className="text-[13px] text-teal font-mono uppercase tracking-wider font-semibold">AI Feedback</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {quiz.feedback ? (
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full bg-teal/10 border border-teal/20 text-base">
                          🤖
                        </div>
                        <p className="text-[13px] font-mono text-text-primary leading-relaxed mt-1 whitespace-pre-wrap">
                          {quiz.feedback}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <div className="text-4xl mb-3">🎯</div>
                        <p className="text-[13px] font-mono text-text-secondary text-center">
                          Write your solution, run the tests, and submit!
                        </p>
                        <p className="text-[11px] font-mono text-text-muted text-center mt-1">
                          You have up to 3 attempts per question.
                        </p>
                      </div>
                    )}
                  </div>
                  {quiz.attemptCount > 0 && (
                    <div className="px-4 py-2 border-t border-border">
                      <span className="text-[11px] font-mono text-text-muted">
                        Attempt {quiz.attemptCount}/3
                      </span>
                    </div>
                  )}
                </div>
              }
              right={
                <BeginnerEditorPanel
                  code={quiz.code}
                  onCodeChange={quiz.setCode}
                  onRun={quiz.handleRun}
                  onSubmit={quiz.handleSubmit}
                  testResults={quiz.testResults}
                  testError={quiz.testError}
                  isRunning={quiz.isRunning}
                  isSubmitting={quiz.isSubmitting}
                  questionText={quiz.currentQuestion.question}
                  questionIndex={quiz.questionIndex}
                  totalQuestions={10}
                  difficulty={quiz.difficulty}
                  questionResults={quiz.questionResults}
                  hint={quiz.currentQuestion.hint}
                />
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[13px] font-mono text-text-muted">
                Something went wrong loading the question.
              </p>
            </div>
          )}
        </WorkspaceLayout>

        {quizComplete && (
          <BeginnerTopicCompleteOverlay
            topicName={topic.title}
            correctCount={finalScore}
            totalQuestions={10}
            xpEarned={xpEarned}
            onNextTopic={handleNextTopic}
            onDashboard={handleDashboard}
            isLastTopic={topic.order >= 6}
          />
        )}
      </>
    );
  }

  // ─── COMPLETED ──────────────────────────────────────
  if (session.status === 'completed') {
    return (
      <WorkspaceLayout topicName={topic.title} xp={profile.totalXP}>
        <div className="flex flex-col items-center justify-center h-full px-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-mono font-bold text-text-bright mb-2">Session Complete</h2>
          <p className="text-[13px] font-mono text-text-secondary mb-4">This session has already been completed.</p>
          <button
            onClick={handleDashboard}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-mono rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </WorkspaceLayout>
    );
  }

  return null;
}
