'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2, Check, Database } from 'lucide-react';

const BEGINNER_TOPICS = [
  {
    id: 'variables',
    title: 'Variables & Data Types',
    description: 'Learn how to store and use data with let, const, strings, numbers, and booleans.',
    order: 1,
    prerequisites: [],
    cumulativeTopics: ['variables'],
    isActive: true,
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Learn how to create reusable blocks of code with parameters and return values.',
    order: 2,
    prerequisites: ['variables'],
    cumulativeTopics: ['variables', 'functions'],
    isActive: true,
  },
  {
    id: 'loops',
    title: 'Loops',
    description: 'Learn how to repeat actions with for loops, while loops, and iteration patterns.',
    order: 3,
    prerequisites: ['functions'],
    cumulativeTopics: ['variables', 'functions', 'loops'],
    isActive: true,
  },
  {
    id: 'arrays',
    title: 'Arrays',
    description: 'Learn how to work with ordered lists of data — access, add, remove, and iterate.',
    order: 4,
    prerequisites: ['loops'],
    cumulativeTopics: ['variables', 'functions', 'loops', 'arrays'],
    isActive: true,
  },
  {
    id: 'objects',
    title: 'Objects',
    description: 'Learn how to group related data using key-value pairs and nested structures.',
    order: 5,
    prerequisites: ['arrays'],
    cumulativeTopics: ['variables', 'functions', 'loops', 'arrays', 'objects'],
    isActive: true,
  },
  {
    id: 'if-else',
    title: 'Conditionals',
    description: 'Learn how to make decisions in code with if/else, comparison, and logical operators.',
    order: 6,
    prerequisites: ['objects'],
    cumulativeTopics: ['variables', 'functions', 'loops', 'arrays', 'objects', 'if-else'],
    isActive: true,
  },
];

export default function SeedPage() {
  const { user, loading } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    setError('');

    try {
      for (const topic of BEGINNER_TOPICS) {
        const { id, ...data } = topic;
        await setDoc(doc(db, 'beginner_topics', id), data);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed');
    }

    setSeeding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <p className="text-[13px] font-mono text-text-muted">Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[400px] text-center">
        <Database size={32} className="text-accent mx-auto mb-4" />
        <h1 className="text-lg font-mono font-bold text-text-bright mb-2">Seed Beginner Topics</h1>
        <p className="text-[12px] font-mono text-text-secondary mb-6">
          This will create {BEGINNER_TOPICS.length} topics in the beginner_topics collection.
        </p>

        {error && (
          <div className="px-3 py-2 bg-error/10 border border-error/20 text-error text-[12px] font-mono rounded-sm mb-4">
            {error}
          </div>
        )}

        {done ? (
          <div className="flex items-center justify-center gap-2 text-success text-[14px] font-mono">
            <Check size={18} />
            Seeded {BEGINNER_TOPICS.length} topics successfully!
          </div>
        ) : (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-mono rounded transition-colors disabled:opacity-50"
          >
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            {seeding ? 'Seeding...' : 'Seed Topics'}
          </button>
        )}
      </div>
    </div>
  );
}
