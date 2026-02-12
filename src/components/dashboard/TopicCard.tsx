'use client';

import { Lock, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  levelsCompleted: number;
  currentLevel: number;
  totalLevels?: number;
  locked?: boolean;
  emoji?: string;
  color?: string;
}

export default function TopicCard({
  id,
  title,
  description,
  levelsCompleted,
  currentLevel,
  totalLevels = 5,
  locked = false,
  emoji = '📁',
  color = '#007acc',
}: TopicCardProps) {
  const progress = (levelsCompleted / totalLevels) * 100;
  const isComplete = levelsCompleted >= totalLevels;

  if (locked) {
    return (
      <div className="relative flex flex-col p-4 bg-bg-secondary border border-border/50 opacity-40 cursor-not-allowed overflow-hidden rounded-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl grayscale opacity-50">{emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-text-muted" />
              <span className="text-[13px] font-mono text-text-muted">{title}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-text-muted font-mono pl-10">{description}</p>
      </div>
    );
  }

  return (
    <Link href={`/quiz/${id}/${currentLevel}`}>
      <div
        className="relative flex flex-col p-4 bg-bg-secondary border border-border hover:border-opacity-60 transition-all cursor-pointer group overflow-hidden rounded-sm"
        style={{ borderLeftWidth: '3px', borderLeftColor: color }}
      >
        {/* Subtle color glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)` }}
        />

        <div className="relative flex items-center gap-3 mb-2">
          <div
            className="text-2xl group-hover:animate-[float_2s_ease-in-out_infinite] transition-transform"
          >
            {emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-mono text-text-primary group-hover:text-text-bright transition-colors">
                {title}
              </span>
              {isComplete && (
                <CheckCircle2 size={14} style={{ color }} />
              )}
            </div>
            <p className="text-[11px] text-text-secondary font-mono leading-relaxed mt-0.5">{description}</p>
          </div>
          <ChevronRight size={16} className="text-text-muted group-hover:translate-x-0.5 transition-transform" style={{ color: `${color}80` }} />
        </div>

        {/* Progress bar */}
        <div className="relative flex items-center gap-2 mt-2 pl-10">
          <div className="flex-1 h-[4px] bg-bg-input rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-[10px] font-mono" style={{ color: `${color}cc` }}>
            {levelsCompleted}/{totalLevels}
          </span>
        </div>

        {/* Level dots */}
        <div className="flex items-center gap-1 mt-2 pl-10">
          {Array.from({ length: totalLevels }, (_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: i < levelsCompleted ? color : `${color}25`,
              }}
            />
          ))}
        </div>

        {/* "New" badge for untouched topics */}
        {levelsCompleted === 0 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Sparkles size={10} />
            new
          </div>
        )}
      </div>
    </Link>
  );
}
