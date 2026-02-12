'use client';

import { Clock, CheckCircle2, AlertCircle, Trophy, Zap } from 'lucide-react';

interface StatusBarProps {
  xp?: number;
  attemptCount?: number;
  timerSeconds?: number;
  connected?: boolean;
  level?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function StatusBar({
  xp = 0,
  attemptCount = 0,
  timerSeconds = 0,
  connected = true,
  level = 1,
}: StatusBarProps) {
  return (
    <div
      className="flex items-center justify-between h-[24px] px-3 text-[12px] text-white select-none font-mono"
      style={{ background: 'linear-gradient(90deg, #007acc, #6b4fa0)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Zap size={12} />
          <span>Level {level}</span>
        </div>
        {attemptCount > 0 && (
          <div className="flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Attempt {attemptCount}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {timerSeconds > 0 && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}
        <div className="flex items-center gap-1 font-bold">
          <Trophy size={12} />
          <span>{xp.toLocaleString()} XP</span>
        </div>
        <div className="flex items-center gap-1 opacity-80">
          {connected ? (
            <CheckCircle2 size={12} />
          ) : (
            <AlertCircle size={12} className="text-yellow-300" />
          )}
          <span>{connected ? 'Ready' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
}
