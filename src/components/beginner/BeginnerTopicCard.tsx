'use client';

import { Check, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { BeginnerTopic } from '@/lib/types';

interface BeginnerTopicCardProps {
  topic: BeginnerTopic;
  status: 'completed' | 'available' | 'locked';
  score?: number;
  emoji: string;
  color: string;
}

export default function BeginnerTopicCard({ topic, status, score, emoji, color }: BeginnerTopicCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const content = (
    <div
      className={`group relative flex items-center gap-4 p-4 bg-bg-secondary border rounded-sm transition-all ${
        isLocked
          ? 'border-border opacity-50 cursor-not-allowed'
          : isCompleted
          ? 'border-border hover:border-teal/50'
          : 'border-accent/30 hover:border-accent bg-accent/5'
      }`}
    >
      {/* Status indicator */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 text-lg"
        style={{
          backgroundColor: isLocked ? '#3c3c3c' : `${color}20`,
          border: `1px solid ${isLocked ? '#555' : `${color}40`}`,
        }}
      >
        {isLocked ? <Lock size={18} className="text-text-muted" /> : isCompleted ? <Check size={18} style={{ color }} /> : emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`text-[14px] font-mono font-semibold ${isLocked ? 'text-text-muted' : 'text-text-bright'}`}>
            {topic.title}
          </h3>
          {isCompleted && (
            <span className="px-1.5 py-0.5 bg-teal/15 border border-teal/20 text-teal text-[10px] font-mono rounded-sm">
              {score} / 10
            </span>
          )}
        </div>
        <p className="text-[12px] font-mono text-text-secondary mt-0.5 truncate">
          {topic.description}
        </p>
      </div>

      {/* Arrow for available */}
      {status === 'available' && (
        <ArrowRight size={16} className="text-accent flex-shrink-0 group-hover:translate-x-1 transition-transform" />
      )}
    </div>
  );

  if (isLocked) return content;

  return (
    <Link href={`/beginner/${topic.id}`}>
      {content}
    </Link>
  );
}
