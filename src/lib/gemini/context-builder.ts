import type { Problem, TestResult, ChatMessage } from '@/lib/types';

interface AssessmentContext {
  topic: string;
  levelType: string;
  level: number;
  problemTitle: string;
  problemDescription: string;
  testCases: { description: string; input: unknown; expectedOutput: unknown }[];
  studentCode: string;
  attemptNumber: number;
  testResults: TestResult[];
  constraints?: string[];
  requiredSolutions?: number;
  submittedSolutions?: { code: string; approach: string }[];
  chatHistory: ChatMessage[];
}

/**
 * Builds a structured context message for Gemini assessment calls.
 * All level-specific behavior is driven by the system prompt —
 * we just provide the facts here.
 */
export function buildAssessmentContext(ctx: AssessmentContext): string {
  const parts: string[] = [];

  parts.push(`## CURRENT SESSION CONTEXT`);
  parts.push(``);
  parts.push(`**Topic**: ${ctx.topic}`);
  parts.push(`**Level**: ${ctx.level} (${ctx.levelType})`);
  parts.push(`**Problem**: ${ctx.problemTitle}`);
  parts.push(`**Problem Description**: ${ctx.problemDescription}`);
  parts.push(`**Attempt Number**: ${ctx.attemptNumber}`);
  parts.push(``);

  // Test cases (visible ones only)
  const visibleTests = ctx.testCases.filter((_tc, i) => i < 5);
  if (visibleTests.length > 0) {
    parts.push(`### Test Cases`);
    visibleTests.forEach((tc, i) => {
      parts.push(`${i + 1}. ${tc.description}`);
      parts.push(`   Input: ${JSON.stringify(tc.input)}`);
      parts.push(`   Expected: ${JSON.stringify(tc.expectedOutput)}`);
    });
    parts.push(``);
  }

  // Constraints (Level 4)
  if (ctx.constraints && ctx.constraints.length > 0) {
    parts.push(`### Constraints (Forbidden Syntax)`);
    parts.push(`The student CANNOT use: ${ctx.constraints.join(', ')}`);
    parts.push(``);
  }

  // Multi-path tracking (Level 2)
  if (ctx.requiredSolutions) {
    parts.push(`### Multi-Path Progress`);
    parts.push(`Required unique solutions: ${ctx.requiredSolutions}`);
    if (ctx.submittedSolutions && ctx.submittedSolutions.length > 0) {
      parts.push(`Already submitted:`);
      ctx.submittedSolutions.forEach((s, i) => {
        parts.push(`  Solution ${i + 1} (${s.approach}):`);
        parts.push(`  \`\`\`js`);
        parts.push(`  ${s.code}`);
        parts.push(`  \`\`\``);
      });
    } else {
      parts.push(`No solutions submitted yet.`);
    }
    parts.push(``);
  }

  // Student's current code
  parts.push(`### Student's Current Code`);
  parts.push(`\`\`\`javascript`);
  parts.push(ctx.studentCode || '// (empty)');
  parts.push(`\`\`\``);
  parts.push(``);

  // Test results
  if (ctx.testResults.length > 0) {
    const passed = ctx.testResults.filter(r => r.passed).length;
    const total = ctx.testResults.length;
    parts.push(`### Test Results (${passed}/${total} passed)`);
    ctx.testResults.forEach(r => {
      const icon = r.passed ? 'PASS' : 'FAIL';
      parts.push(`- [${icon}] ${r.description}`);
      if (!r.passed) {
        parts.push(`  Expected: ${JSON.stringify(r.expected)}`);
        parts.push(`  Actual: ${JSON.stringify(r.actual)}`);
        if (r.error) parts.push(`  Error: ${r.error}`);
      }
    });
    parts.push(``);
  }

  // Recent chat (last 10 messages for context window management)
  const recentChat = ctx.chatHistory.slice(-10);
  if (recentChat.length > 0) {
    parts.push(`### Recent Chat History`);
    recentChat.forEach(msg => {
      if (msg.role === 'system') return;
      const label = msg.role === 'user' ? 'Student' : 'AI Tutor';
      parts.push(`**${label}**: ${msg.content}`);
    });
    parts.push(``);
  }

  return parts.join('\n');
}

/**
 * Builds context for a general chat message (not an assessment).
 * The student is asking a question or making a comment.
 */
export function buildChatContext(ctx: {
  topic: string;
  levelType: string;
  level: number;
  problemTitle: string;
  problemDescription: string;
  studentCode: string;
  attemptNumber: number;
  constraints?: string[];
  chatHistory: ChatMessage[];
  userMessage: string;
}): string {
  const parts: string[] = [];

  parts.push(`## CURRENT SESSION CONTEXT`);
  parts.push(``);
  parts.push(`**Topic**: ${ctx.topic}`);
  parts.push(`**Level**: ${ctx.level} (${ctx.levelType})`);
  parts.push(`**Problem**: ${ctx.problemTitle}`);
  parts.push(`**Problem Description**: ${ctx.problemDescription}`);
  parts.push(`**Attempt Number**: ${ctx.attemptNumber}`);
  parts.push(``);

  if (ctx.constraints && ctx.constraints.length > 0) {
    parts.push(`### Constraints (Forbidden Syntax)`);
    parts.push(`The student CANNOT use: ${ctx.constraints.join(', ')}`);
    parts.push(``);
  }

  if (ctx.studentCode) {
    parts.push(`### Student's Current Code`);
    parts.push(`\`\`\`javascript`);
    parts.push(ctx.studentCode);
    parts.push(`\`\`\``);
    parts.push(``);
  }

  // Recent chat
  const recentChat = ctx.chatHistory.slice(-10);
  if (recentChat.length > 0) {
    parts.push(`### Recent Chat History`);
    recentChat.forEach(msg => {
      if (msg.role === 'system') return;
      const label = msg.role === 'user' ? 'Student' : 'AI Tutor';
      parts.push(`**${label}**: ${msg.content}`);
    });
    parts.push(``);
  }

  parts.push(`### Student's New Message`);
  parts.push(ctx.userMessage);

  return parts.join('\n');
}
