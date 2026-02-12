import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Topic,
  Problem,
  Session,
  UserProgress,
  SkillBars,
  BeginnerTopic,
  BeginnerSession,
  CallDocument,
  TutorAvailability,
} from '@/lib/types';

// ─── Topics ──────────────────────────────────────────

export async function getTopics(): Promise<Topic[]> {
  const snap = await getDocs(
    query(collection(db, 'quiz_topics'), orderBy('order'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
}

export async function getTopic(topicId: string): Promise<Topic | null> {
  const snap = await getDoc(doc(db, 'quiz_topics', topicId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Topic) : null;
}

// ─── Problems ────────────────────────────────────────

export async function getProblemsForLevel(
  topicId: string,
  level: number
): Promise<Problem[]> {
  const snap = await getDocs(
    query(
      collection(db, 'quiz_problems'),
      where('topicId', '==', topicId),
      where('level', '==', level),
      orderBy('order')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Problem));
}

export async function getProblem(problemId: string): Promise<Problem | null> {
  const snap = await getDoc(doc(db, 'quiz_problems', problemId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Problem) : null;
}

// ─── User Progress ───────────────────────────────────

export async function getUserProgress(userId: string) {
  const snap = await getDoc(doc(db, 'quiz_users', userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    progress: (data.progress || {}) as UserProgress,
    totalXP: (data.totalXP || 0) as number,
    skillBars: (data.skillBars || {
      syntaxFluency: 0,
      patternRecognition: 0,
      debugInstinct: 0,
      creativeThinking: 0,
      builderScore: 0,
    }) as SkillBars,
    displayName: (data.displayName || 'Developer') as string,
  };
}

// ─── Sessions ────────────────────────────────────────

export async function createSession(data: {
  userId: string;
  topicId: string;
  problemId: string;
  level: number;
  levelType: string;
}): Promise<string> {
  const ref = doc(collection(db, 'quiz_sessions'));
  await setDoc(ref, {
    ...data,
    status: 'active',
    attemptCount: 0,
    currentCode: '',
    score: null,
    submittedSolutions: [],
    startedAt: serverTimestamp(),
    completedAt: null,
  });
  return ref.id;
}

export async function getActiveSession(
  userId: string,
  topicId: string,
  level: number
): Promise<(Session & { id: string }) | null> {
  const snap = await getDocs(
    query(
      collection(db, 'quiz_sessions'),
      where('userId', '==', userId),
      where('topicId', '==', topicId),
      where('level', '==', level),
      where('status', '==', 'active')
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Session & { id: string };
}

export async function updateSession(
  sessionId: string,
  data: Partial<{
    currentCode: string;
    attemptCount: number;
    status: string;
    score: number;
    completedAt: unknown;
    submittedSolutions: unknown[];
  }>
) {
  await updateDoc(doc(db, 'quiz_sessions', sessionId), data);
}

// ─── Chat Messages ───────────────────────────────────

export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
) {
  const ref = doc(collection(db, 'quiz_sessions', sessionId, 'messages'));
  await setDoc(ref, {
    role,
    content,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}

export async function getChatMessages(sessionId: string) {
  const snap = await getDocs(
    query(
      collection(db, 'quiz_sessions', sessionId, 'messages'),
      orderBy('timestamp')
    )
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: (d.data().timestamp as Timestamp)?.toMillis?.() || Date.now(),
  }));
}

// ─── Level Completion ────────────────────────────────

export async function completeLevel(
  userId: string,
  topicId: string,
  level: number,
  score: number,
  sessionId?: string
) {
  const userRef = doc(db, 'quiz_users', userId);

  // Ensure user doc exists (create with defaults if missing)
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: userId,
      totalXP: 0,
      progress: {},
      skillBars: {
        syntaxFluency: 0,
        patternRecognition: 0,
        debugInstinct: 0,
        creativeThinking: 0,
        builderScore: 0,
      },
      createdAt: serverTimestamp(),
    });
  }

  const batch = writeBatch(db);

  // Update session if we have a real session ID
  if (sessionId && sessionId !== 'direct') {
    batch.update(doc(db, 'quiz_sessions', sessionId), {
      status: 'completed',
      score,
      completedAt: serverTimestamp(),
    });
  }

  // Update user progress
  batch.update(userRef, {
    [`progress.${topicId}.currentLevel`]: Math.min(level + 1, 5),
    [`progress.${topicId}.levelsCompleted`]: increment(1),
    [`progress.${topicId}.totalScore`]: increment(score),
    totalXP: increment(score),
    lastActiveAt: serverTimestamp(),
  });

  await batch.commit();
}

// ─── Beginner Topics ─────────────────────────────────

export async function getBeginnerTopics(): Promise<BeginnerTopic[]> {
  const snap = await getDocs(
    query(collection(db, 'beginner_topics'), orderBy('order'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BeginnerTopic));
}

export async function getBeginnerTopic(topicId: string): Promise<BeginnerTopic | null> {
  const snap = await getDoc(doc(db, 'beginner_topics', topicId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as BeginnerTopic) : null;
}

// ─── Beginner Sessions ──────────────────────────────

export async function createBeginnerSession(data: {
  studentId: string;
  tutorId: string;
  topicId: string;
  livekitRoom: string;
  liveblocksRoom: string;
}): Promise<string> {
  const ref = doc(collection(db, 'beginner_sessions'));
  await setDoc(ref, {
    ...data,
    status: 'calling',
    questions: [],
    currentQuestionIndex: 0,
    currentDifficulty: 'easy',
    correctCount: 0,
    totalScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedAt: null,
  });
  return ref.id;
}

export async function updateBeginnerSession(
  sessionId: string,
  data: Partial<BeginnerSession>
) {
  await updateDoc(doc(db, 'beginner_sessions', sessionId), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function getBeginnerSession(sessionId: string): Promise<BeginnerSession | null> {
  const snap = await getDoc(doc(db, 'beginner_sessions', sessionId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as BeginnerSession) : null;
}

// ─── Calls ───────────────────────────────────────────

export async function createCall(data: {
  studentId: string;
  studentName: string;
  tutorId: string;
  topicId: string;
  sessionId: string;
  livekitRoom: string;
}): Promise<string> {
  const ref = doc(collection(db, 'calls'));
  await setDoc(ref, {
    ...data,
    status: 'ringing',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateCall(
  callId: string,
  data: Partial<CallDocument>
) {
  await updateDoc(doc(db, 'calls', callId), {
    ...data,
    updatedAt: Date.now(),
  });
}

// ─── Tutor Availability ─────────────────────────────

export async function getOnlineTutors(): Promise<TutorAvailability[]> {
  const snap = await getDocs(
    query(
      collection(db, 'tutor_availability'),
      where('isOnline', '==', true)
    )
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as TutorAvailability));
}

export async function updateTutorAvailability(
  uid: string,
  data: Partial<TutorAvailability>
) {
  // Use setDoc with merge so it creates the doc if it doesn't exist yet
  // (handles tutors who signed up before the doc creation was fixed).
  await setDoc(doc(db, 'tutor_availability', uid), data, { merge: true });
}

// ─── Beginner Topic Completion ──────────────────────

export async function completeBeginnerTopic(
  userId: string,
  topicId: string,
  score: number,
  sessionId: string
) {
  const userRef = doc(db, 'quiz_users', userId);
  const xpEarned = score * 10; // 10 XP per correct question

  const batch = writeBatch(db);

  batch.update(userRef, {
    [`beginnerProgress.${topicId}`]: {
      completed: true,
      score,
      completedAt: Date.now(),
    },
    totalXP: increment(xpEarned),
    lastActiveAt: serverTimestamp(),
  });

  // Mark session completed
  batch.update(doc(db, 'beginner_sessions', sessionId), {
    status: 'completed',
    totalScore: score,
    completedAt: Date.now(),
    updatedAt: Date.now(),
  });

  await batch.commit();
  return xpEarned;
}
