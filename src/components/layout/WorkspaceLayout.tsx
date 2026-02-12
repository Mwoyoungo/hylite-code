'use client';

import TitleBar from './TitleBar';
import ActivityBar from './ActivityBar';
import StatusBar from './StatusBar';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  topicName?: string;
  levelName?: string;
  xp?: number;
  attemptCount?: number;
  timerSeconds?: number;
  level?: number;
  completedLevels?: number[];
  showActivityBar?: boolean;
  showStatusBar?: boolean;
}

export default function WorkspaceLayout({
  children,
  topicName,
  levelName,
  xp = 0,
  attemptCount = 0,
  timerSeconds = 0,
  level = 1,
  completedLevels = [],
  showActivityBar = true,
  showStatusBar = true,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-primary">
      <TitleBar
        topicName={topicName}
        levelName={levelName}
        currentLevel={level}
        completedLevels={completedLevels}
      />
      <div className="flex flex-1 overflow-hidden">
        {showActivityBar && <ActivityBar />}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      {showStatusBar && (
        <StatusBar
          xp={xp}
          attemptCount={attemptCount}
          timerSeconds={timerSeconds}
          level={level}
        />
      )}
    </div>
  );
}
