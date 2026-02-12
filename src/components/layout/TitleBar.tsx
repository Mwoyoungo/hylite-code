'use client';

import { Zap, PenLine, GitFork, Bug, Lock, Rocket, Check, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface TitleBarProps {
  topicName?: string;
  levelName?: string;
  currentLevel?: number;
  completedLevels?: number[];
}

const levelIcons = [PenLine, GitFork, Bug, Lock, Rocket];
const levelColors = ['#4ec9b0', '#c586c0', '#ef6b73', '#e8925b', '#9cdcfe'];
const levelNames = ['Syntax', 'Multi-Path', 'Debug', 'Constraint', 'Project'];

export default function TitleBar({ topicName, levelName, currentLevel = 1, completedLevels = [] }: TitleBarProps) {
  const { profile } = useAuth();
  const isBeginnerMode = profile?.mode === 'beginner' || profile?.role === 'tutor';

  return (
    <div className="flex items-center justify-between h-[32px] bg-titlebar px-3 select-none border-b border-border">
      <div className="flex items-center gap-2">
        {isBeginnerMode ? (
          <BookOpen size={14} className="text-teal" />
        ) : (
          <Zap size={14} className="text-accent" />
        )}
        <span className="text-[13px]">
          <span className="text-text-bright font-medium">
            {isBeginnerMode ? 'Hylite Learn' : 'Quantum Quiz'}
          </span>
          {topicName && (
            <>
              <span className="text-text-muted mx-1.5">/</span>
              <span className="text-purple">{topicName}</span>
            </>
          )}
          {levelName && isBeginnerMode && (
            <>
              <span className="text-text-muted mx-1.5">/</span>
              <span className="text-teal">{levelName}</span>
            </>
          )}
        </span>
      </div>

      {/* Right section: Quantum level dots or beginner phase */}
      {!isBeginnerMode && (
        <div className="flex items-center gap-1">
          {levelIcons.map((Icon, i) => {
            const level = i + 1;
            const isActive = level === currentLevel;
            const isCompleted = completedLevels.includes(level);
            const color = levelColors[i];

            return (
              <div
                key={level}
                title={levelNames[i]}
                className="flex items-center gap-1 px-2 py-1 rounded-sm transition-all"
                style={{
                  backgroundColor: isActive ? `${color}18` : 'transparent',
                  borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                }}
              >
                {isCompleted ? (
                  <Check size={12} style={{ color }} />
                ) : (
                  <Icon size={12} style={{ color: isActive ? color : '#7a7a7a' }} />
                )}
                <span
                  className="text-[11px] font-mono hidden lg:inline"
                  style={{ color: isActive ? color : isCompleted ? color : '#7a7a7a' }}
                >
                  {levelNames[i]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
