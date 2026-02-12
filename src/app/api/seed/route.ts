import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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

export async function POST() {
  try {
    for (const topic of BEGINNER_TOPICS) {
      const { id, ...data } = topic;
      await setDoc(doc(db, 'beginner_topics', id), data);
    }
    return NextResponse.json({ ok: true, count: BEGINNER_TOPICS.length });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
