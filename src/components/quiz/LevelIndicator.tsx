'use client';

import { LEVEL_LABELS } from '@/lib/types';

interface LevelIndicatorProps {
  currentLevel: number;
  completedLevels?: number[];
}

const levelColors: Record<number, string> = {
  1: '#4ec9b0', // teal — Syntax
  2: '#c586c0', // purple — Multi-path
  3: '#ef6b73', // coral — Error nav
  4: '#e8925b', // orange — Constraint
  5: '#9cdcfe', // sky — Micro-project
};

const levelEmojis: Record<number, string> = {
  1: '✍️',
  2: '🔀',
  3: '🐛',
  4: '🔒',
  5: '🚀',
};

export default function LevelIndicator({ currentLevel, completedLevels = [] }: LevelIndicatorProps) {
  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-bg-secondary overflow-x-auto">
      {[1, 2, 3, 4, 5].map((level) => {
        const isActive = level === currentLevel;
        const isCompleted = completedLevels.includes(level);
        const label = LEVEL_LABELS[level];
        const color = levelColors[level];
        const emoji = levelEmojis[level];

        return (
          <div
            key={level}
            title={`${label.name}: ${label.description}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-mono transition-all cursor-default"
            style={{
              backgroundColor: isActive ? `${color}20` : 'transparent',
              borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
              color: isActive ? color : isCompleted ? `${color}cc` : '#7a7a7a',
            }}
          >
            <span className="text-base">{isCompleted ? '✅' : emoji}</span>
            <span className="hidden md:inline">{label.name}</span>
            {!isCompleted && <span className="md:hidden">{level}</span>}
          </div>
        );
      })}
    </div>
  );
}
