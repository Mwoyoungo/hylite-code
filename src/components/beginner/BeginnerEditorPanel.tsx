'use client';

import { Play, Send, FileCode } from 'lucide-react';
import CodeEditor from '@/components/quiz/CodeEditor';
import TerminalOutput from '@/components/quiz/TerminalOutput';
import QuestionProgress from './QuestionProgress';
import DifficultyBadge from './DifficultyBadge';
import type { TestResult } from '@/lib/types';

interface BeginnerEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  testResults: TestResult[];
  testError?: string | null;
  isRunning?: boolean;
  isSubmitting?: boolean;
  questionText: string;
  questionIndex: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionResults: (boolean | null)[];
  hint?: string;
}

export default function BeginnerEditorPanel({
  code,
  onCodeChange,
  onRun,
  onSubmit,
  testResults,
  testError,
  isRunning = false,
  isSubmitting = false,
  questionText,
  questionIndex,
  totalQuestions,
  difficulty,
  questionResults,
  hint,
}: BeginnerEditorPanelProps) {
  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Question header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-bg-secondary">
        <span className="text-[13px] font-mono text-text-bright font-semibold">
          Question {questionIndex + 1}/{totalQuestions}
        </span>
        <DifficultyBadge difficulty={difficulty} />
        <div className="ml-auto">
          <QuestionProgress total={totalQuestions} current={questionIndex} results={questionResults} />
        </div>
      </div>

      {/* Question description */}
      <div className="px-4 py-3 border-b border-border bg-bg-tertiary">
        <p className="text-[13px] font-mono text-text-primary leading-relaxed">
          {questionText}
        </p>
        {hint && (
          <p className="text-[11px] font-mono text-yellow mt-2 opacity-80">
            Hint: {hint}
          </p>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center h-[38px] bg-bg-tertiary border-b border-border">
        <div className="flex items-center gap-1.5 px-3 h-full bg-tab-active border-t-2 border-t-accent text-text-bright text-[13px] font-mono">
          <FileCode size={15} />
          solution.js
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <CodeEditor value={code} onChange={onCodeChange} />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-b border-border bg-bg-secondary">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-mono bg-bg-input hover:bg-bg-hover text-text-bright border border-border transition-colors disabled:opacity-50"
        >
          <Play size={14} className="text-success" />
          Run
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-mono bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
        >
          <Send size={14} />
          Submit
        </button>
        <div className="flex items-center gap-2 ml-auto text-[12px] font-mono text-text-secondary">
          <kbd className="px-1.5 py-0.5 bg-bg-input text-[11px] border border-border">Ctrl+Enter</kbd>
          <span>Run</span>
          <kbd className="px-1.5 py-0.5 bg-bg-input text-[11px] border border-border ml-2">Ctrl+Shift+Enter</kbd>
          <span>Submit</span>
        </div>
      </div>

      {/* Terminal */}
      <div style={{ height: '25%' }} className="flex-shrink-0 overflow-hidden">
        <TerminalOutput results={testResults} error={testError} isRunning={isRunning} />
      </div>
    </div>
  );
}
