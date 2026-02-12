'use client';

import { Terminal, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { TestResult } from '@/lib/types';

interface TerminalOutputProps {
  results: TestResult[];
  error?: string | null;
  isRunning?: boolean;
}

export default function TerminalOutput({ results, error, isRunning = false }: TerminalOutputProps) {
  const passCount = results.filter(r => r.passed).length;
  const failCount = results.filter(r => !r.passed).length;

  return (
    <div className="flex flex-col h-full bg-terminal">
      <div className="flex items-center gap-2 h-[34px] px-3 border-t border-b border-border bg-bg-tertiary flex-shrink-0">
        <Terminal size={14} className="text-text-secondary" />
        <span className="text-[12px] text-text-secondary font-mono uppercase tracking-wider">Output</span>
        {results.length > 0 && (
          <div className="flex items-center gap-2 ml-auto text-[12px] font-mono">
            {passCount > 0 && (
              <span className="text-success">{passCount} passed</span>
            )}
            {failCount > 0 && (
              <span className="text-error">{failCount} failed</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-[13px]">
        {isRunning ? (
          <div className="text-text-muted animate-pulse">Running tests...</div>
        ) : error ? (
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-error mt-0.5 flex-shrink-0" />
            <pre className="text-error whitespace-pre-wrap">{error}</pre>
          </div>
        ) : results.length === 0 ? (
          <div className="text-text-muted">
            Press <kbd className="px-1.5 py-0.5 bg-bg-input text-text-secondary text-[12px] border border-border">Ctrl+Enter</kbd> to run your code
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {results.map((result) => (
              <div key={result.testCaseId} className="flex items-start gap-2">
                {result.passed ? (
                  <CheckCircle2 size={15} className="text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle size={15} className="text-error mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className={result.passed ? 'text-success' : 'text-error'}>
                    {result.description}
                  </span>
                  {!result.passed && (
                    <div className="text-text-muted mt-0.5">
                      {result.error ? (
                        <span className="text-error">Error: {result.error}</span>
                      ) : (
                        <>
                          <span>Expected: {JSON.stringify(result.expected)}</span>
                          <span className="mx-1">|</span>
                          <span>Got: {JSON.stringify(result.actual)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
