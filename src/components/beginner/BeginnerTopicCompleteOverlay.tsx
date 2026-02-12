'use client';

import { Trophy, ArrowRight, Home, Star, Target } from 'lucide-react';

interface BeginnerTopicCompleteOverlayProps {
  topicName: string;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  onNextTopic: () => void;
  onDashboard: () => void;
  isLastTopic: boolean;
}

export default function BeginnerTopicCompleteOverlay({
  topicName,
  correctCount,
  totalQuestions,
  xpEarned,
  onNextTopic,
  onDashboard,
  isLastTopic,
}: BeginnerTopicCompleteOverlayProps) {
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = correctCount >= Math.ceil(totalQuestions / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border rounded-lg w-[420px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal/20 via-accent/20 to-purple/20 px-6 py-5 text-center border-b border-border">
          <div className="text-5xl mb-2">
            {passed ? (isLastTopic ? '🏆' : '🎉') : '💪'}
          </div>
          <h2 className="text-xl font-bold text-text-primary font-mono">
            {passed ? 'Topic Complete!' : 'Keep Practicing!'}
          </h2>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            {topicName}
          </p>
        </div>

        {/* Score */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="flex items-center gap-2 text-text-secondary">
              <Target size={14} className="text-teal" />
              Questions Correct
            </span>
            <span className="text-text-primary font-bold">{correctCount} / {totalQuestions}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-mono">
            <span className="flex items-center gap-2 text-text-secondary">
              <Star size={14} className="text-yellow" />
              Accuracy
            </span>
            <span className="text-text-primary">{percentage}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-bg-input rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${percentage}%`,
                background: passed
                  ? 'linear-gradient(90deg, #4ec9b0, #007acc)'
                  : 'linear-gradient(90deg, #e8925b, #cca700)',
              }}
            />
          </div>

          <div className="border-t border-border my-2" />

          <div className="flex items-center justify-between font-mono">
            <span className="flex items-center gap-2 text-text-primary font-bold">
              <Trophy size={16} className="text-orange" />
              XP Earned
            </span>
            <span className="text-xl font-bold text-orange">+{xpEarned}</span>
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
          {passed && !isLastTopic && (
            <button
              onClick={onNextTopic}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-accent hover:bg-accent-hover text-white rounded transition-colors"
            >
              Next Topic
              <ArrowRight size={14} />
            </button>
          )}
          {passed && isLastTopic && (
            <button
              onClick={onDashboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-gradient-to-r from-teal to-purple text-white rounded transition-colors hover:opacity-90"
            >
              <Trophy size={14} />
              All Complete!
            </button>
          )}
          {!passed && (
            <button
              onClick={onDashboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-teal hover:bg-teal/80 text-white rounded transition-colors"
            >
              Try Again
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
