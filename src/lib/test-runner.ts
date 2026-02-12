import type { TestCase, TestResult } from './types';

export function runTests(code: string, functionName: string, testCases: TestCase[]): {
  results: TestResult[];
  error: string | null;
} {
  try {
    const wrappedCode = `${code}\nreturn typeof ${functionName} === 'function' ? ${functionName} : undefined;`;
    const fn = new Function(wrappedCode)();

    if (!fn) {
      return {
        results: [],
        error: `Function "${functionName}" not found. Make sure you define it!`,
      };
    }

    const results: TestResult[] = testCases
      .filter((tc) => !tc.isHidden)
      .map((tc) => {
        try {
          const args = Array.isArray(tc.input) ? tc.input : tc.input !== null ? [tc.input] : [];
          const actual = fn(...args);
          const passed = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
          return {
            testCaseId: tc.id,
            description: tc.description,
            passed,
            actual,
            expected: tc.expectedOutput,
            error: null,
          };
        } catch (err) {
          return {
            testCaseId: tc.id,
            description: tc.description,
            passed: false,
            actual: undefined,
            expected: tc.expectedOutput,
            error: err instanceof Error ? err.message : 'Runtime error',
          };
        }
      });

    return { results, error: null };
  } catch (err) {
    return {
      results: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
