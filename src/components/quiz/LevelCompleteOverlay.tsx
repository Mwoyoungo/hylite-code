'use client';

import { Trophy, ArrowRight, Home, Star, Zap, Clock, Target } from 'lucide-react';
import type { ScoreBreakdown } from '@/lib/types';

interface LevelCompleteOverlayProps {
  level: number;
  topicName: string;
  score: ScoreBreakdown;
  onNextLevel: () => void;
  onDashboard: () => void;
  isLastLevel: boolean;
}

export default function LevelCompleteOverlay({
  level,
  topicName,
  score,
  onNextLevel,
  onDashboard,
  isLastLevel,
}: LevelCompleteOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border rounded-lg w-[420px] overflow-hidden shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple/20 via-teal/20 to-orange/20 px-6 py-5 text-center border-b border-border">
          <div className="text-5xl mb-2">
            {isLastLevel ? '🏆' : '🎉'}
          </div>
          <h2 className="text-xl font-bold text-text-primary font-mono">
            {isLastLevel ? 'Topic Complete!' : 'Level Complete!'}
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            {topicName} — Level {level}
          </p>
        </div>

        {/* Score breakdown */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="flex items-center gap-2 text-text-secondary">
              <Target size={14} className="text-purple" />
              Base Points
            </span>
            <span className="text-text-primary">{score.basePoints}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-mono">
            <span className="flex items-center gap-2 text-text-secondary">
              <Star size={14} className="text-orange" />
              Attempt Multiplier
            </span>
            <span className="text-text-primary">x{score.attemptMultiplier}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-mono">
            <span className="flex items-center gap-2 text-text-secondary">
              <Clock size={14} className="text-teal" />
              Speed Bonus
            </span>
            <span className="text-teal">+{score.speedBonus}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-mono">
            <span className="flex items-center gap-2 text-text-secondary">
              <Zap size={14} className="text-yellow" />
              Creativity Bonus
            </span>
            <span className="text-yellow">+{score.creativityBonus}</span>
          </div>

          <div className="border-t border-border my-2" />

          <div className="flex items-center justify-between font-mono">
            <span className="flex items-center gap-2 text-text-primary font-bold">
              <Trophy size={16} className="text-orange" />
              Total XP Earned
            </span>
            <span className="text-xl font-bold text-orange">{score.finalScore}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onDashboard}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-bg-input hover:bg-bg-hover text-text-primary border border-border rounded transition-colors"
          >
            <Home size={14} />
            Dashboard
          </button>
          {!isLastLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-accent hover:bg-accent-hover text-white rounded transition-colors"
            >
              Next Level
              <ArrowRight size={14} />
            </button>
          )}
          {isLastLevel && (
            <button
              onClick={onDashboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-gradient-to-r from-purple to-teal text-white rounded transition-colors hover:opacity-90"
            >
              <Trophy size={14} />
              Back to Topics
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
