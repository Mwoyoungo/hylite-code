'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import SplitPanel from '@/components/quiz/SplitPanel';
import ChatPanel from '@/components/quiz/ChatPanel';
import EditorPanel from '@/components/quiz/EditorPanel';
import LevelCompleteOverlay from '@/components/quiz/LevelCompleteOverlay';
import { Loader2 } from 'lucide-react';
import { getProblemsForLevel, getTopic, getUserProgress, completeLevel } from '@/lib/firebase/firestore';
import { calculateScore } from '@/lib/scoring';
import type { ChatMessage, TestResult, LevelType, Problem, Topic, ScoreBreakdown } from '@/lib/types';
import { LEVEL_LABELS } from '@/lib/types';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const topicId = params.topicId as string;
  const level = parseInt(params.level as string, 10);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testError, setTestError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [levelComplete, setLevelComplete] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);

  // Timer — track seconds since page load
  const startTimeRef = useRef(Date.now());
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    async function loadData() {
      const [problems, topicData, userData] = await Promise.all([
        getProblemsForLevel(topicId, level),
        getTopic(topicId),
        getUserProgress(user!.uid),
      ]);

      if (problems.length === 0 || !topicData) {
        router.replace('/dashboard');
        return;
      }

      const prob = problems[0];
      // Parse serialized test cases
      prob.testCases = prob.testCases.map((tc) => ({
        ...tc,
        input: typeof tc.input === 'string' ? JSON.parse(tc.input as string) : tc.input,
        expectedOutput: typeof tc.expectedOutput === 'string' ? JSON.parse(tc.expectedOutput as string) : tc.expectedOutput,
      }));

      setProblem(prob);
      setTopic(topicData);
      setTotalXP(userData?.totalXP || 0);
      startTimeRef.current = Date.now();

      // Set starter code for error navigation levels
      if (prob.starterCode) {
        setCode(prob.starterCode);
      } else {
        const fnName = (prob as unknown as { functionName?: string }).functionName || 'solution';
        setCode(`// Write your solution here\nfunction ${fnName}() {\n  \n}\n`);
      }

      // Initial AI message
      const levelLabel = LEVEL_LABELS[level];
      setMessages([
        {
          id: 'sys-1',
          role: 'system',
          content: `Level ${level}: ${levelLabel?.name} — ${topicData.title}`,
          timestamp: Date.now(),
        },
        {
          id: 'ai-intro',
          role: 'assistant',
          content: `${getIntroMessage(prob, level)}`,
          timestamp: Date.now(),
        },
      ]);

      setLoading(false);
    }

    loadData();
  }, [user, authLoading, router, topicId, level]);

  // Stream a response from an API endpoint into a chat message
  const streamAIResponse = useCallback(async (url: string, body: object) => {
    const aiMsgId = `ai-${Date.now()}`;

    // Add placeholder AI message
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
    }]);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        const currentText = fullText;
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: currentText } : m)
        );
      }

      return fullText;
    } catch (err) {
      const errorText = 'Sorry, I had trouble connecting. Try again in a moment!';
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, content: errorText } : m)
      );
      return null;
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!problem || !topic || levelComplete) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    const levelLabel = LEVEL_LABELS[level];
    await streamAIResponse('/api/ai/chat', {
      topic: topic.title,
      levelType: levelLabel?.type || 'syntax',
      level,
      problemTitle: problem.title,
      problemDescription: problem.description,
      studentCode: code,
      attemptNumber: attemptCount,
      constraints: problem.constraints,
      chatHistory: [...messagesRef.current, userMsg],
      userMessage: content,
    });

    setIsChatLoading(false);
  }, [problem, topic, level, code, attemptCount, levelComplete, streamAIResponse]);

  const handleRun = useCallback(() => {
    if (!problem || levelComplete) return;
    setIsRunning(true);
    setTestError(null);

    setTimeout(() => {
      try {
        const fnName = (problem as unknown as { functionName?: string }).functionName || 'solution';
        const wrappedCode = `${code}\nreturn typeof ${fnName} === 'function' ? ${fnName} : undefined;`;
        const fn = new Function(wrappedCode)();

        if (!fn) {
          setTestError(`Function "${fnName}" not found. Make sure you define it!`);
          setTestResults([]);
          setIsRunning(false);
          return;
        }

        const results: TestResult[] = problem.testCases
          .filter(tc => !tc.isHidden)
          .map((tc) => {
            try {
              const args = Array.isArray(tc.input) ? tc.input : (tc.input !== null ? [tc.input] : []);
              const actual = fn(...args);
              const passed = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
              return {
                testCaseId: tc.id,
                description: tc.description,
                passed,
                actual,
                expected: tc.expectedOutput,
                error: null,
              };
            } catch (err) {
              return {
                testCaseId: tc.id,
                description: tc.description,
                passed: false,
                actual: undefined,
                expected: tc.expectedOutput,
                error: err instanceof Error ? err.message : 'Runtime error',
              };
            }
          });

        setTestResults(results);
        setAttemptCount(prev => prev + 1);
      } catch (err) {
        setTestError(err instanceof Error ? err.message : 'Unknown error');
        setTestResults([]);
      }
      setIsRunning(false);
    }, 300);
  }, [code, problem, levelComplete]);

  const handleSubmit = useCallback(async () => {
    if (!problem || !topic || !user || levelComplete) return;

    // Must run code first
    if (testResults.length === 0) {
      const noRunMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Run your code first before submitting! Click the **Run** button to see your test results.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, noRunMsg]);
      return;
    }

    setIsSubmitting(true);

    const levelLabel = LEVEL_LABELS[level];
    const fullResponse = await streamAIResponse('/api/ai/assess', {
      topic: topic.title,
      levelType: levelLabel?.type || 'syntax',
      level,
      problemTitle: problem.title,
      problemDescription: problem.description,
      testCases: problem.testCases.filter(tc => !tc.isHidden).map(tc => ({
        description: tc.description,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
      studentCode: code,
      attemptNumber: attemptCount,
      testResults,
      constraints: problem.constraints,
      requiredSolutions: problem.requiredSolutions,
      submittedSolutions: [],
      chatHistory: messagesRef.current,
    });

    // Parse assessment JSON
    let passed = false;
    let creativityScore = 0;

    if (fullResponse) {
      try {
        const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          const assessment = JSON.parse(jsonMatch[1]);
          passed = assessment.passed === true;
          creativityScore = assessment.creativityScore || 0;

          // Replace raw response with clean feedback
          if (assessment.feedback) {
            const lastMsg = messagesRef.current[messagesRef.current.length - 1];
            if (lastMsg.role === 'assistant') {
              setMessages(prev =>
                prev.map(m => m.id === lastMsg.id ? { ...m, content: assessment.feedback } : m)
              );
            }
          }
        } else {
          // No JSON block — check if all tests passed as fallback
          const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
          passed = allPassed;
        }
      } catch {
        // Fallback: check test results directly
        passed = testResults.length > 0 && testResults.every(r => r.passed);
      }
    }

    // If passed, calculate score & save progress
    if (passed) {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const score = calculateScore(level, attemptCount, elapsedSeconds, creativityScore);
      setScoreBreakdown(score);

      // Save to Firestore
      try {
        await completeLevel(user.uid, topicId, level, score.finalScore, 'direct');
        setTotalXP(prev => prev + score.finalScore);
      } catch (err) {
        console.error('Failed to save progress:', err);
      }

      setLevelComplete(true);
    }

    setIsSubmitting(false);
  }, [problem, topic, user, level, code, attemptCount, testResults, levelComplete, topicId, streamAIResponse]);

  const handleNextLevel = useCallback(() => {
    if (level < 5) {
      router.push(`/quiz/${topicId}/${level + 1}`);
    } else {
      router.push('/dashboard');
    }
  }, [router, topicId, level]);

  const handleDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!problem || !topic) return null;

  const levelLabel = LEVEL_LABELS[level];

  return (
    <>
      <WorkspaceLayout
        topicName={topic.title}
        levelName={levelLabel?.name}
        xp={totalXP}
        attemptCount={attemptCount}
        level={level}
      >
        <SplitPanel
          left={
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isSubmitting || isChatLoading}
            />
          }
          right={
            <EditorPanel
              code={code}
              onCodeChange={setCode}
              onRun={handleRun}
              onSubmit={handleSubmit}
              testResults={testResults}
              testError={testError}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              problemTitle={problem.title}
              problemDescription={problem.description}
              level={level}
              levelType={problem.levelType as LevelType}
              completedLevels={[]}
              constraints={problem.constraints}
              multiPathSolutions={problem.levelType === 'multi-path' ? [] : undefined}
              requiredSolutions={problem.requiredSolutions}
            />
          }
        />
      </WorkspaceLayout>

      {levelComplete && scoreBreakdown && (
        <LevelCompleteOverlay
          level={level}
          topicName={topic.title}
          score={scoreBreakdown}
          onNextLevel={handleNextLevel}
          onDashboard={handleDashboard}
          isLastLevel={level >= 5}
        />
      )}
    </>
  );
}

function getIntroMessage(problem: Problem, level: number): string {
  const fnName = (problem as unknown as { functionName?: string }).functionName || 'solution';

  switch (level) {
    case 1:
      return `Let's work on syntax basics!\n\n${problem.description}\n\nDefine your function \`${fnName}\` in the editor and hit Run to test it. You've got this!`;
    case 2:
      return `Time for multi-path thinking!\n\n${problem.description}\n\nYou need to find ${problem.requiredSolutions || 3} completely different approaches. Start with whatever feels natural, then get creative!`;
    case 3:
      return `Bug hunt time! 🐛\n\nI've loaded some broken code into the editor. ${problem.description}\n\nRead through it carefully, find the bugs, and fix them. Run the tests to check your fixes.`;
    case 4:
      return `Constraint challenge! 🔒\n\n${problem.description}\n\nForbidden: ${problem.constraints?.join(', ')}. This forces you to think outside the box. What other JavaScript features can you use?`;
    case 5:
      return `Time to build something real! 🚀\n\n${problem.description}\n\nBreak it down into small steps. Get one feature working at a time, then move to the next.`;
    default:
      return problem.description;
  }
}
