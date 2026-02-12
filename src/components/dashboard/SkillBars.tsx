'use client';

import type { SkillBars as SkillBarsType } from '@/lib/types';

interface SkillBarsProps {
  skills: SkillBarsType;
}

const skillConfig = [
  { key: 'syntaxFluency' as const, label: 'Syntax Fluency', emoji: '✍️', color: '#4ec9b0' },
  { key: 'patternRecognition' as const, label: 'Pattern Recognition', emoji: '🔀', color: '#c586c0' },
  { key: 'debugInstinct' as const, label: 'Debug Instinct', emoji: '🐛', color: '#ef6b73' },
  { key: 'creativeThinking' as const, label: 'Creative Thinking', emoji: '💡', color: '#e8925b' },
  { key: 'builderScore' as const, label: 'Builder Score', emoji: '🚀', color: '#9cdcfe' },
];

function getSkillRank(value: number): string {
  if (value >= 90) return 'Master';
  if (value >= 70) return 'Advanced';
  if (value >= 50) return 'Intermediate';
  if (value >= 25) return 'Beginner';
  return 'Novice';
}

export default function SkillBars({ skills }: SkillBarsProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-bg-secondary border border-border rounded-sm">
      <div className="flex items-center gap-2">
        <span className="text-base">📊</span>
        <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Skill Stats</span>
      </div>
      {skillConfig.map(({ key, label, emoji, color }) => {
        const value = skills[key];
        const rank = getSkillRank(value);
        return (
          <div key={key} className="flex items-center gap-2.5">
            <span className="text-base flex-shrink-0">{emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-text-secondary">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-text-muted">{rank}</span>
                  <span className="text-[11px] font-mono font-bold" style={{ color }}>{value}%</span>
                </div>
              </div>
              <div className="h-[5px] bg-bg-input rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${value}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
