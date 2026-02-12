/**
 * Run this once to seed the beginner_topics collection in Firestore.
 * Usage: npx tsx src/lib/firebase/seed-beginner-topics.ts
 *
 * Or call seedBeginnerTopics() from a one-off API route / script.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from './config';

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

export async function seedBeginnerTopics() {
  for (const topic of BEGINNER_TOPICS) {
    await setDoc(doc(db, 'beginner_topics', topic.id), {
      title: topic.title,
      description: topic.description,
      order: topic.order,
      prerequisites: topic.prerequisites,
      cumulativeTopics: topic.cumulativeTopics,
      isActive: topic.isActive,
    });
    console.log(`Seeded: ${topic.id}`);
  }
  console.log('Done seeding beginner topics!');
}
