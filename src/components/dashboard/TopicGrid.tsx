'use client';

import TopicCard from './TopicCard';

interface TopicData {
  id: string;
  title: string;
  description: string;
  levelsCompleted: number;
  currentLevel: number;
  locked?: boolean;
  emoji?: string;
  color?: string;
}

interface TopicGridProps {
  topics: TopicData[];
}

export default function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {topics.map((topic) => (
        <TopicCard key={topic.id} {...topic} />
      ))}
    </div>
  );
}
