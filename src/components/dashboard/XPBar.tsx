'use client';

interface XPBarProps {
  currentXP: number;
  nextLevelXP?: number;
  level?: number;
}

export default function XPBar({ currentXP, nextLevelXP = 1000, level = 1 }: XPBarProps) {
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <div className="flex items-center gap-3 p-4 bg-bg-secondary border border-border rounded-sm overflow-hidden relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-purple/5 pointer-events-none" />

      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple text-white text-sm font-mono font-bold">
        {level}
      </div>
      <div className="relative flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-mono text-text-primary">Level {level}</span>
          <span className="text-[11px] font-mono text-text-muted">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
        </div>
        <div className="h-[6px] bg-bg-input rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #007acc, #c586c0)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
