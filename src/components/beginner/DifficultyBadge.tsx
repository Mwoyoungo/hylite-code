'use client';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

const config = {
  easy: { label: 'Easy', color: '#4ec9b0', bg: 'rgba(78, 201, 176, 0.15)', border: 'rgba(78, 201, 176, 0.3)' },
  medium: { label: 'Medium', color: '#cca700', bg: 'rgba(204, 167, 0, 0.15)', border: 'rgba(204, 167, 0, 0.3)' },
  hard: { label: 'Hard', color: '#f44747', bg: 'rgba(244, 71, 71, 0.15)', border: 'rgba(244, 71, 71, 0.3)' },
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const c = config[difficulty];
  return (
    <span
      className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-sm"
      style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}
