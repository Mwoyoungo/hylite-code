'use client';

import { GitBranch, Check } from 'lucide-react';

interface MultiPathTrackerProps {
  totalRequired: number;
  solutions: { solutionNumber: number; approach: string }[];
}

export default function MultiPathTracker({ totalRequired, solutions }: MultiPathTrackerProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-accent-dim/30 border-b border-border">
      <GitBranch size={14} className="text-accent" />
      <span className="text-[11px] font-mono text-accent">
        Multi-Path Challenge: {solutions.length}/{totalRequired} solutions
      </span>
      <div className="flex items-center gap-1 ml-auto">
        {Array.from({ length: totalRequired }, (_, i) => {
          const solution = solutions[i];
          return (
            <div
              key={i}
              title={solution ? `Solution ${i + 1}: ${solution.approach}` : `Solution ${i + 1}: Not yet found`}
              className={`
                flex items-center justify-center w-5 h-5 text-[10px] font-mono border
                ${solution
                  ? 'bg-success/20 border-success/40 text-success'
                  : 'border-text-muted/30 text-text-muted'
                }
              `}
            >
              {solution ? <Check size={10} /> : i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
