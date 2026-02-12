'use client';

import BeginnerTopicCard from './BeginnerTopicCard';
import type { BeginnerTopic } from '@/lib/types';

const topicMeta: Record<string, { emoji: string; color: string }> = {
  variables: { emoji: '📦', color: '#c586c0' },
  functions: { emoji: '⚡', color: '#dcdcaa' },
  loops: { emoji: '🔁', color: '#e8925b' },
  arrays: { emoji: '📚', color: '#9cdcfe' },
  objects: { emoji: '🧩', color: '#f472b6' },
  'if-else': { emoji: '🔀', color: '#4ec9b0' },
};

interface BeginnerTopicListProps {
  topics: BeginnerTopic[];
  beginnerProgress: Record<string, { completed: boolean; score: number; completedAt: number | null }>;
}

export default function BeginnerTopicList({ topics, beginnerProgress }: BeginnerTopicListProps) {
  const getStatus = (topic: BeginnerTopic, index: number): 'completed' | 'available' | 'locked' => {
    const progress = beginnerProgress[topic.id];
    if (progress?.completed) return 'completed';
    // First topic or all prerequisites completed
    if (index === 0) return 'available';
    const prevTopic = topics[index - 1];
    if (prevTopic && beginnerProgress[prevTopic.id]?.completed) return 'available';
    return 'locked';
  };

  return (
    <div className="flex flex-col gap-2">
      {topics.map((topic, i) => {
        const status = getStatus(topic, i);
        const meta = topicMeta[topic.id] || { emoji: '📁', color: '#007acc' };
        const progress = beginnerProgress[topic.id];

        return (
          <BeginnerTopicCard
            key={topic.id}
            topic={topic}
            status={status}
            score={progress?.score}
            emoji={meta.emoji}
            color={meta.color}
          />
        );
      })}
    </div>
  );
}
