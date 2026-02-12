interface QuestionContext {
  topicId: string;
  topicTitle: string;
  cumulativeTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionIndex: number;
  previousQuestions: { prompt: string; functionName: string }[];
}

interface EvaluationContext {
  question: string;
  functionName: string;
  testCases: { description: string; input: unknown; expectedOutput: unknown }[];
  studentCode: string;
  attemptNumber: number;
}

export function buildBeginnerQuestionContext(ctx: QuestionContext): string {
  const parts: string[] = [];

  parts.push(`## GENERATE QUESTION ${ctx.questionIndex + 1} of 10`);
  parts.push(``);
  parts.push(`**Current Topic**: ${ctx.topicTitle} (${ctx.topicId})`);
  parts.push(`**Cumulative Topics**: ${ctx.cumulativeTopics.join(', ')}`);
  parts.push(`**Difficulty**: ${ctx.difficulty}`);
  parts.push(``);

  if (ctx.previousQuestions.length > 0) {
    parts.push(`### Previous Questions (avoid repeating similar patterns)`);
    ctx.previousQuestions.forEach((q, i) => {
      parts.push(`${i + 1}. "${q.prompt}" (fn: ${q.functionName})`);
    });
    parts.push(``);
  }

  parts.push(`Generate a ${ctx.difficulty} difficulty JavaScript coding question that tests the cumulative topics listed above. Respond with ONLY the JSON object — no text, no explanation, no markdown fences. The JSON must have these fields: question, functionName, testCases (array of {id, description, input, expectedOutput, isHidden}), hint, difficulty, topicsTested.`);

  return parts.join('\n');
}

export function buildBeginnerEvaluationContext(ctx: EvaluationContext): string {
  const parts: string[] = [];

  parts.push(`## EVALUATE STUDENT CODE`);
  parts.push(``);
  parts.push(`**Question**: ${ctx.question}`);
  parts.push(`**Function Name**: ${ctx.functionName}`);
  parts.push(`**Attempt**: ${ctx.attemptNumber}`);
  parts.push(``);

  parts.push(`### Test Cases`);
  ctx.testCases.forEach((tc, i) => {
    parts.push(`${i + 1}. ${tc.description}`);
    parts.push(`   Input: ${JSON.stringify(tc.input)}`);
    parts.push(`   Expected: ${JSON.stringify(tc.expectedOutput)}`);
  });
  parts.push(``);

  parts.push(`### Student's Code`);
  parts.push('```javascript');
  parts.push(ctx.studentCode || '// (empty)');
  parts.push('```');
  parts.push(``);

  parts.push(`Evaluate the student's code against the test cases. Respond with ONLY the JSON object — no text, no explanation, no markdown fences. The JSON must have these fields: passed (boolean), feedback (string), failedTests (array of strings), correctCount (number), totalTests (number).`);

  return parts.join('\n');
}
