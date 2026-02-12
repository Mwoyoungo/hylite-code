'use client';

import { useState, useCallback, useRef } from 'react';
import { runTests } from '@/lib/test-runner';
import { updateBeginnerSession } from '@/lib/firebase/firestore';
import type { TestCase, TestResult, BeginnerQuestion } from '@/lib/types';

interface QuizQuestion {
  question: string;
  functionName: string;
  testCases: TestCase[];
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicsTested: string[];
}

interface UseBeginnerQuizOptions {
  sessionId: string;
  topicId: string;
  topicTitle: string;
  cumulativeTopics: string[];
  totalQuestions?: number;
  onComplete: (correctCount: number) => void;
}

export function useBeginnerQuiz({
  sessionId,
  topicId,
  topicTitle,
  cumulativeTopics,
  totalQuestions = 10,
  onComplete,
}: UseBeginnerQuizOptions) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testError, setTestError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [questionResults, setQuestionResults] = useState<(boolean | null)[]>(
    Array(totalQuestions).fill(null)
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const consecutiveCorrectRef = useRef(0);
  const consecutiveWrongRef = useRef(0);
  const previousQuestionsRef = useRef<{ prompt: string; functionName: string }[]>([]);
  const questionsDataRef = useRef<BeginnerQuestion[]>([]);

  const fetchQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setTestResults([]);
    setTestError(null);
    setFeedback(null);
    setAttemptCount(0);

    try {
      const res = await fetch('/api/ai/beginner/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          topicTitle,
          cumulativeTopics,
          difficulty,
          questionIndex,
          previousQuestions: previousQuestionsRef.current,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch question');

      const parsed = await res.json() as QuizQuestion;

      // Parse test case inputs/outputs
      parsed.testCases = parsed.testCases.map((tc, i) => ({
        ...tc,
        id: tc.id || String(i + 1),
        isHidden: tc.isHidden ?? false,
        input: typeof tc.input === 'string' ? JSON.parse(tc.input as string) : tc.input,
        expectedOutput: typeof tc.expectedOutput === 'string'
          ? JSON.parse(tc.expectedOutput as string)
          : tc.expectedOutput,
      }));

      setCurrentQuestion(parsed);
      setCode(`// Write your solution here\nfunction ${parsed.functionName}() {\n  \n}\n`);

      previousQuestionsRef.current.push({
        prompt: parsed.question,
        functionName: parsed.functionName,
      });
    } catch (err) {
      console.error('Failed to load question:', err);
      setFeedback('Failed to load question. Please try again.');
    }

    setIsLoadingQuestion(false);
  }, [topicId, topicTitle, cumulativeTopics, difficulty, questionIndex]);

  const handleRun = useCallback(() => {
    if (!currentQuestion) return;
    setIsRunning(true);
    setTestError(null);

    setTimeout(() => {
      const { results, error } = runTests(code, currentQuestion.functionName, currentQuestion.testCases);
      setTestResults(results);
      setTestError(error);
      setAttemptCount((prev) => prev + 1);
      setIsRunning(false);
    }, 300);
  }, [code, currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion) return;

    // Must run first
    if (testResults.length === 0) {
      setFeedback('Run your code first before submitting!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/ai/beginner/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          functionName: currentQuestion.functionName,
          testCases: currentQuestion.testCases.map((tc) => ({
            description: tc.description,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
          studentCode: code,
          attemptNumber: attemptCount,
        }),
      });

      if (!res.ok) throw new Error('Evaluation failed');

      let passed = false;
      let evalFeedback = 'Could not evaluate. Check your code and try again.';

      try {
        const evaluation = await res.json();
        passed = evaluation.passed === true;
        evalFeedback = evaluation.feedback || evalFeedback;
      } catch {
        // Fallback: check local test results
        passed = testResults.length > 0 && testResults.every((r) => r.passed);
        evalFeedback = passed ? 'All tests passed!' : 'Some tests are failing. Check your code.';
      }

      setFeedback(evalFeedback);

      // Record question result
      const questionData: BeginnerQuestion = {
        index: questionIndex,
        prompt: currentQuestion.question,
        functionName: currentQuestion.functionName,
        difficulty: currentQuestion.difficulty,
        topicsTested: currentQuestion.topicsTested,
        testCases: currentQuestion.testCases,
        studentCode: code,
        passed,
        feedback: evalFeedback,
        attemptCount,
      };
      questionsDataRef.current.push(questionData);

      if (passed) {
        // Mark as correct
        setCorrectCount((prev) => prev + 1);
        setQuestionResults((prev) => {
          const next = [...prev];
          next[questionIndex] = true;
          return next;
        });

        consecutiveCorrectRef.current += 1;
        consecutiveWrongRef.current = 0;

        // Adjust difficulty up
        if (consecutiveCorrectRef.current >= 2) {
          consecutiveCorrectRef.current = 0;
          setDifficulty((d) => (d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : 'hard'));
        }

        // Save to session
        try {
          await updateBeginnerSession(sessionId, {
            questions: questionsDataRef.current,
            currentQuestionIndex: questionIndex + 1,
            currentDifficulty: difficulty,
            correctCount: correctCount + 1,
          } as Partial<import('@/lib/types').BeginnerSession>);
        } catch {}

        // Auto-advance after short delay
        setTimeout(() => {
          if (questionIndex + 1 >= totalQuestions) {
            onComplete(correctCount + 1);
          } else {
            setQuestionIndex((prev) => prev + 1);
          }
        }, 2000);
      } else if (attemptCount >= 3) {
        // Max attempts — mark as failed, move on
        setQuestionResults((prev) => {
          const next = [...prev];
          next[questionIndex] = false;
          return next;
        });

        consecutiveWrongRef.current += 1;
        consecutiveCorrectRef.current = 0;

        // Adjust difficulty down
        if (consecutiveWrongRef.current >= 2) {
          consecutiveWrongRef.current = 0;
          setDifficulty((d) => (d === 'hard' ? 'medium' : d === 'medium' ? 'easy' : 'easy'));
        }

        try {
          await updateBeginnerSession(sessionId, {
            questions: questionsDataRef.current,
            currentQuestionIndex: questionIndex + 1,
            currentDifficulty: difficulty,
          } as Partial<import('@/lib/types').BeginnerSession>);
        } catch {}

        setTimeout(() => {
          if (questionIndex + 1 >= totalQuestions) {
            onComplete(correctCount);
          } else {
            setQuestionIndex((prev) => prev + 1);
          }
        }, 2500);
      }
      // Otherwise: let them try again (attempts < 3 and not passed)
    } catch (err) {
      setFeedback('Evaluation failed. Please try again.');
    }

    setIsSubmitting(false);
  }, [currentQuestion, testResults, code, attemptCount, questionIndex, totalQuestions, correctCount, difficulty, sessionId, onComplete]);

  return {
    currentQuestion,
    questionIndex,
    difficulty,
    code,
    setCode,
    testResults,
    testError,
    isRunning,
    isSubmitting,
    isLoadingQuestion,
    feedback,
    questionResults,
    correctCount,
    attemptCount,
    fetchQuestion,
    handleRun,
    handleSubmit,
  };
}
