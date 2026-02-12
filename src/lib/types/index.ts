export type LevelType = 'syntax' | 'multi-path' | 'error-navigation' | 'constraint' | 'micro-project';

export interface TestCase {
  id: string;
  description: string;
  input: unknown;
  expectedOutput: unknown;
  isHidden: boolean;
}

export interface TestResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  error: string | null;
}

export interface Problem {
  id: string;
  topicId: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelType: LevelType;
  title: string;
  description: string;
  starterCode?: string;
  constraints?: string[];
  projectRequirements?: string[];
  testCases: TestCase[];
  requiredSolutions?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  prerequisites: string[];
  isActive: boolean;
}

export interface UserProgress {
  [topicId: string]: {
    currentLevel: number;
    levelsCompleted: number;
    totalScore: number;
  };
}

export interface SkillBars {
  syntaxFluency: number;
  patternRecognition: number;
  debugInstinct: number;
  creativeThinking: number;
  builderScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  userId: string;
  topicId: string;
  problemId: string;
  level: number;
  levelType: LevelType;
  status: 'active' | 'completed' | 'abandoned';
  attemptCount: number;
  currentCode: string;
  score: number | null;
  submittedSolutions: {
    solutionNumber: number;
    code: string;
    approach: string;
  }[];
  startedAt: number;
  completedAt: number | null;
}

export interface ScoreBreakdown {
  basePoints: number;
  attemptMultiplier: number;
  creativityBonus: number;
  speedBonus: number;
  finalScore: number;
}

// ─── Beginner Mode Types ────────────────────────────

export interface BeginnerTopic {
  id: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  cumulativeTopics: string[];
  isActive: boolean;
}

export type BeginnerSessionStatus = 'calling' | 'teaching' | 'quiz' | 'completed';

export interface BeginnerSession {
  id: string;
  studentId: string;
  tutorId: string;
  topicId: string;
  status: BeginnerSessionStatus;
  livekitRoom: string;
  liveblocksRoom: string;
  questions: BeginnerQuestion[];
  currentQuestionIndex: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  correctCount: number;
  totalScore: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface BeginnerQuestion {
  index: number;
  prompt: string;
  functionName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicsTested: string[];
  testCases: TestCase[];
  studentCode: string;
  passed: boolean | null;
  feedback: string;
  attemptCount: number;
}

export type CallStatus = 'ringing' | 'accepted' | 'declined' | 'missed' | 'cancelled' | 'ended';

export interface CallDocument {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  topicId: string;
  status: CallStatus;
  sessionId: string;
  livekitRoom: string;
  endedBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TutorAvailability {
  uid: string;
  displayName: string;
  photoURL: string | null;
  isOnline: boolean;
  specialties: string[];
  inSession: boolean;
  lastOnlineAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'student' | 'tutor';
  mode: 'beginner' | 'advanced' | null;
  totalXP: number;
  progress: UserProgress;
  skillBars: SkillBars;
  beginnerProgress: Record<string, { completed: boolean; score: number; completedAt: number | null }>;
}

export const LEVEL_LABELS: Record<number, { name: string; type: LevelType; description: string }> = {
  1: { name: 'Syntax Foundation', type: 'syntax', description: 'Can you write it correctly?' },
  2: { name: 'Multi-Path Thinking', type: 'multi-path', description: 'Can you solve it different ways?' },
  3: { name: 'Error Navigation', type: 'error-navigation', description: 'Can you debug when things break?' },
  4: { name: 'Constraint Adaptation', type: 'constraint', description: 'Can you find creative solutions?' },
  5: { name: 'Real Application', type: 'micro-project', description: 'Can you build something functional?' },
};
