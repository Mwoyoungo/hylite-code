'use client';

import { useState } from 'react';
import { Play, Send, FileCode } from 'lucide-react';
import CodeEditor from './CodeEditor';
import TerminalOutput from './TerminalOutput';
import ProblemStatement from './ProblemStatement';
import LevelIndicator from './LevelIndicator';
import MultiPathTracker from './MultiPathTracker';
import ConstraintBanner from './ConstraintBanner';
import type { TestResult, LevelType } from '@/lib/types';

interface EditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  testResults: TestResult[];
  testError?: string | null;
  isRunning?: boolean;
  isSubmitting?: boolean;
  problemTitle: string;
  problemDescription: string;
  level: number;
  levelType: LevelType;
  completedLevels?: number[];
  constraints?: string[];
  multiPathSolutions?: { solutionNumber: number; approach: string }[];
  requiredSolutions?: number;
}

export default function EditorPanel({
  code,
  onCodeChange,
  onRun,
  onSubmit,
  testResults,
  testError,
  isRunning = false,
  isSubmitting = false,
  problemTitle,
  problemDescription,
  level,
  levelType,
  completedLevels = [],
  constraints,
  multiPathSolutions,
  requiredSolutions = 3,
}: EditorPanelProps) {
  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <LevelIndicator currentLevel={level} completedLevels={completedLevels} />

      {levelType === 'multi-path' && multiPathSolutions && (
        <MultiPathTracker totalRequired={requiredSolutions} solutions={multiPathSolutions} />
      )}

      {levelType === 'constraint' && constraints && constraints.length > 0 && (
        <ConstraintBanner constraints={constraints} />
      )}

      {/* Tab bar */}
      <div className="flex items-center h-[38px] bg-bg-tertiary border-b border-border">
        <div className="flex items-center gap-1.5 px-3 h-full bg-tab-active border-t-2 border-t-accent text-text-bright text-[13px] font-mono">
          <FileCode size={15} />
          solution.js
        </div>
      </div>

      <ProblemStatement
        title={problemTitle}
        description={problemDescription}
        level={level}
        levelType={levelType}
      />

      {/* Editor area — takes most space */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <CodeEditor value={code} onChange={onCodeChange} />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-b border-border bg-bg-secondary">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-mono bg-bg-input hover:bg-bg-hover text-text-bright border border-border transition-colors disabled:opacity-50"
          title="Run Code (Ctrl+Enter)"
        >
          <Play size={14} className="text-success" />
          Run
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-mono bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
          title="Submit for Assessment (Ctrl+Shift+Enter)"
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

      {/* Terminal — compact, 25% height */}
      <div style={{ height: '25%' }} className="flex-shrink-0 overflow-hidden">
        <TerminalOutput results={testResults} error={testError} isRunning={isRunning} />
      </div>
    </div>
  );
}
