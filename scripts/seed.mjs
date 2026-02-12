// Run with: node scripts/seed.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSHBgf2AjN4eP8k7IC37wp3O_LliCVIMc",
  authDomain: "hylite-32228.firebaseapp.com",
  projectId: "hylite-32228",
  storageBucket: "hylite-32228.firebasestorage.app",
  messagingSenderId: "708419000865",
  appId: "1:708419000865:web:5017ad437d4baeee3da160",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Topics ──────────────────────────────────────────

const topics = [
  {
    id: 'variables',
    title: 'Variables & Data Types',
    description: 'Learn let, const, var, and primitive types in JavaScript',
    category: 'fundamentals',
    order: 1,
    prerequisites: [],
    isActive: true,
    emoji: '📦',
    color: '#c586c0',
  },
  {
    id: 'if-else',
    title: 'If/Else Statements',
    description: 'Master conditional logic and branching',
    category: 'fundamentals',
    order: 2,
    prerequisites: ['variables'],
    isActive: true,
    emoji: '🔀',
    color: '#4ec9b0',
  },
  {
    id: 'loops',
    title: 'Loops',
    description: 'for, while, do-while, and iteration patterns',
    category: 'fundamentals',
    order: 3,
    prerequisites: ['if-else'],
    isActive: true,
    emoji: '🔁',
    color: '#e8925b',
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Declarations, expressions, arrow functions, and scope',
    category: 'fundamentals',
    order: 4,
    prerequisites: ['loops'],
    isActive: true,
    emoji: '⚡',
    color: '#dcdcaa',
  },
  {
    id: 'arrays',
    title: 'Arrays',
    description: 'Array methods, iteration, and manipulation',
    category: 'data-structures',
    order: 5,
    prerequisites: ['functions'],
    isActive: true,
    emoji: '📚',
    color: '#9cdcfe',
  },
];

// ─── Problems ────────────────────────────────────────

const problems = [
  // ═══ VARIABLES ═══
  // Level 1: Syntax
  {
    id: 'var-l1-1',
    topicId: 'variables',
    level: 1,
    levelType: 'syntax',
    title: 'Declare and Return',
    description: 'Create a function called greet that declares a variable called message with the value "Hello, World!" and returns it.',
    functionName: 'greet',
    testCases: [
      { id: 'tc1', description: 'greet() should return "Hello, World!"', input: null, expectedOutput: 'Hello, World!', isHidden: false },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 2: Multi-Path
  {
    id: 'var-l2-1',
    topicId: 'variables',
    level: 2,
    levelType: 'multi-path',
    title: 'Swap Two Values',
    description: 'Create a function called swap that takes two values (a, b) and returns them swapped as an array [b, a]. Find 3 different ways to do this!',
    functionName: 'swap',
    requiredSolutions: 3,
    testCases: [
      { id: 'tc1', description: 'swap(1, 2) should return [2, 1]', input: [1, 2], expectedOutput: [2, 1], isHidden: false },
      { id: 'tc2', description: 'swap("a", "b") should return ["b", "a"]', input: ['a', 'b'], expectedOutput: ['b', 'a'], isHidden: false },
      { id: 'tc3', description: 'swap(0, 0) should return [0, 0]', input: [0, 0], expectedOutput: [0, 0], isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 3: Error Navigation
  {
    id: 'var-l3-1',
    topicId: 'variables',
    level: 3,
    levelType: 'error-navigation',
    title: 'Fix the Variable Bugs',
    description: 'This function has 3 bugs related to variable declarations. Find and fix them all!',
    functionName: 'calculateTotal',
    starterCode: `function calculateTotal(price, quantity) {
  totl = price * quantity;
  const tax = totl * 0.1;
  let finalPrice = totl + tax
  finalPrice = "R" + finalPrice;
  return finalprice;
}`,
    testCases: [
      { id: 'tc1', description: 'calculateTotal(100, 2) should return "R220"', input: [100, 2], expectedOutput: 'R220', isHidden: false },
      { id: 'tc2', description: 'calculateTotal(50, 1) should return "R55"', input: [50, 1], expectedOutput: 'R55', isHidden: false },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 4: Constraint
  {
    id: 'var-l4-1',
    topicId: 'variables',
    level: 4,
    levelType: 'constraint',
    title: 'No Let or Const',
    description: 'Create a function called double that takes a number and returns it doubled. Constraint: You cannot use "let" or "const" keywords!',
    functionName: 'double',
    constraints: ['let', 'const'],
    testCases: [
      { id: 'tc1', description: 'double(5) should return 10', input: [5], expectedOutput: 10, isHidden: false },
      { id: 'tc2', description: 'double(0) should return 0', input: [0], expectedOutput: 0, isHidden: false },
      { id: 'tc3', description: 'double(-3) should return -6', input: [-3], expectedOutput: -6, isHidden: true },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 5: Micro-Project
  {
    id: 'var-l5-1',
    topicId: 'variables',
    level: 5,
    levelType: 'micro-project',
    title: 'Mini Calculator',
    description: 'Build a calculate function that takes three arguments: num1, operator (+, -, *, /), and num2. Return the result. Handle division by zero by returning "Error".',
    functionName: 'calculate',
    projectRequirements: ['Addition works', 'Subtraction works', 'Multiplication works', 'Division works', 'Division by zero returns "Error"'],
    testCases: [
      { id: 'tc1', description: 'calculate(5, "+", 3) should return 8', input: [5, '+', 3], expectedOutput: 8, isHidden: false },
      { id: 'tc2', description: 'calculate(10, "-", 4) should return 6', input: [10, '-', 4], expectedOutput: 6, isHidden: false },
      { id: 'tc3', description: 'calculate(3, "*", 7) should return 21', input: [3, '*', 7], expectedOutput: 21, isHidden: false },
      { id: 'tc4', description: 'calculate(20, "/", 5) should return 4', input: [20, '/', 5], expectedOutput: 4, isHidden: false },
      { id: 'tc5', description: 'calculate(10, "/", 0) should return "Error"', input: [10, '/', 0], expectedOutput: 'Error', isHidden: false },
    ],
    difficulty: 'medium',
    order: 1,
  },

  // ═══ IF/ELSE ═══
  // Level 1: Syntax
  {
    id: 'ie-l1-1',
    topicId: 'if-else',
    level: 1,
    levelType: 'syntax',
    title: 'Check Age',
    description: 'Create a function called checkAge that takes a number (age) and returns "adult" if 18 or older, "minor" if under 18.',
    functionName: 'checkAge',
    testCases: [
      { id: 'tc1', description: 'checkAge(20) should return "adult"', input: [20], expectedOutput: 'adult', isHidden: false },
      { id: 'tc2', description: 'checkAge(15) should return "minor"', input: [15], expectedOutput: 'minor', isHidden: false },
      { id: 'tc3', description: 'checkAge(18) should return "adult"', input: [18], expectedOutput: 'adult', isHidden: false },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 2: Multi-Path
  {
    id: 'ie-l2-1',
    topicId: 'if-else',
    level: 2,
    levelType: 'multi-path',
    title: 'Grade Calculator',
    description: 'Create a function called getGrade that takes a score (0-100) and returns: "A" (90+), "B" (80-89), "C" (70-79), "D" (60-69), "F" (below 60). Find 3 different ways!',
    functionName: 'getGrade',
    requiredSolutions: 3,
    testCases: [
      { id: 'tc1', description: 'getGrade(95) should return "A"', input: [95], expectedOutput: 'A', isHidden: false },
      { id: 'tc2', description: 'getGrade(85) should return "B"', input: [85], expectedOutput: 'B', isHidden: false },
      { id: 'tc3', description: 'getGrade(72) should return "C"', input: [72], expectedOutput: 'C', isHidden: false },
      { id: 'tc4', description: 'getGrade(65) should return "D"', input: [65], expectedOutput: 'D', isHidden: false },
      { id: 'tc5', description: 'getGrade(50) should return "F"', input: [50], expectedOutput: 'F', isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 3: Error Navigation
  {
    id: 'ie-l3-1',
    topicId: 'if-else',
    level: 3,
    levelType: 'error-navigation',
    title: 'Fix the Conditions',
    description: 'This function classifies temperatures but has bugs. Find and fix them!',
    functionName: 'classifyTemp',
    starterCode: `function classifyTemp(temp) {
  if (temp > 30) {
    return "hot";
  } else if (temp > 20) {
    return "warm";
  } else if (temp > 10) {
    return "cool"
  } else {
    return cold;
  }
}`,
    testCases: [
      { id: 'tc1', description: 'classifyTemp(35) should return "hot"', input: [35], expectedOutput: 'hot', isHidden: false },
      { id: 'tc2', description: 'classifyTemp(25) should return "warm"', input: [25], expectedOutput: 'warm', isHidden: false },
      { id: 'tc3', description: 'classifyTemp(15) should return "cool"', input: [15], expectedOutput: 'cool', isHidden: false },
      { id: 'tc4', description: 'classifyTemp(5) should return "cold"', input: [5], expectedOutput: 'cold', isHidden: false },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 4: Constraint
  {
    id: 'ie-l4-1',
    topicId: 'if-else',
    level: 4,
    levelType: 'constraint',
    title: 'No If/Else Allowed',
    description: 'Create a function called isEven that returns true if a number is even, false if odd. Constraint: NO if, else, or switch allowed!',
    functionName: 'isEven',
    constraints: ['if', 'else', 'switch'],
    testCases: [
      { id: 'tc1', description: 'isEven(4) should return true', input: [4], expectedOutput: true, isHidden: false },
      { id: 'tc2', description: 'isEven(7) should return false', input: [7], expectedOutput: false, isHidden: false },
      { id: 'tc3', description: 'isEven(0) should return true', input: [0], expectedOutput: true, isHidden: true },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 5: Micro-Project
  {
    id: 'ie-l5-1',
    topicId: 'if-else',
    level: 5,
    levelType: 'micro-project',
    title: 'Ticket Price Calculator',
    description: 'Build a function called ticketPrice that takes age and dayOfWeek ("Monday"-"Sunday"). Rules: Kids (under 12) = R30, Adults (12-64) = R50, Seniors (65+) = R35. On weekends (Saturday/Sunday), everyone gets 20% off. Return the price as a number.',
    functionName: 'ticketPrice',
    projectRequirements: ['Kids pricing works', 'Adult pricing works', 'Senior pricing works', 'Weekend discount applies', 'Returns correct number'],
    testCases: [
      { id: 'tc1', description: 'ticketPrice(8, "Monday") should return 30', input: [8, 'Monday'], expectedOutput: 30, isHidden: false },
      { id: 'tc2', description: 'ticketPrice(30, "Tuesday") should return 50', input: [30, 'Tuesday'], expectedOutput: 50, isHidden: false },
      { id: 'tc3', description: 'ticketPrice(70, "Wednesday") should return 35', input: [70, 'Wednesday'], expectedOutput: 35, isHidden: false },
      { id: 'tc4', description: 'ticketPrice(30, "Saturday") should return 40', input: [30, 'Saturday'], expectedOutput: 40, isHidden: false },
      { id: 'tc5', description: 'ticketPrice(8, "Sunday") should return 24', input: [8, 'Sunday'], expectedOutput: 24, isHidden: true },
    ],
    difficulty: 'medium',
    order: 1,
  },

  // ═══ LOOPS ═══
  // Level 1: Syntax
  {
    id: 'loop-l1-1',
    topicId: 'loops',
    level: 1,
    levelType: 'syntax',
    title: 'Sum Numbers',
    description: 'Create a function called sumTo that takes a number n and returns the sum of all numbers from 1 to n (inclusive).',
    functionName: 'sumTo',
    testCases: [
      { id: 'tc1', description: 'sumTo(5) should return 15', input: [5], expectedOutput: 15, isHidden: false },
      { id: 'tc2', description: 'sumTo(10) should return 55', input: [10], expectedOutput: 55, isHidden: false },
      { id: 'tc3', description: 'sumTo(1) should return 1', input: [1], expectedOutput: 1, isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 2: Multi-Path
  {
    id: 'loop-l2-1',
    topicId: 'loops',
    level: 2,
    levelType: 'multi-path',
    title: 'Reverse a String',
    description: 'Create a function called reverseStr that takes a string and returns it reversed. Find 3 different ways!',
    functionName: 'reverseStr',
    requiredSolutions: 3,
    testCases: [
      { id: 'tc1', description: 'reverseStr("hello") should return "olleh"', input: ['hello'], expectedOutput: 'olleh', isHidden: false },
      { id: 'tc2', description: 'reverseStr("abc") should return "cba"', input: ['abc'], expectedOutput: 'cba', isHidden: false },
      { id: 'tc3', description: 'reverseStr("") should return ""', input: [''], expectedOutput: '', isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 3: Error Navigation
  {
    id: 'loop-l3-1',
    topicId: 'loops',
    level: 3,
    levelType: 'error-navigation',
    title: 'Fix the Loop',
    description: 'This function should count down from n to 1, but it has bugs. Find and fix them!',
    functionName: 'countdown',
    starterCode: `function countdown(n) {
  let result = [];
  for (let i = n; i >= 0; i--) {
    result.push(i);
  }
  return result;
}`,
    testCases: [
      { id: 'tc1', description: 'countdown(5) should return [5,4,3,2,1]', input: [5], expectedOutput: [5,4,3,2,1], isHidden: false },
      { id: 'tc2', description: 'countdown(3) should return [3,2,1]', input: [3], expectedOutput: [3,2,1], isHidden: false },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 4: Constraint
  {
    id: 'loop-l4-1',
    topicId: 'loops',
    level: 4,
    levelType: 'constraint',
    title: 'No For Loops',
    description: 'Create a function called repeat that takes a string and a number n, and returns the string repeated n times. Constraint: NO "for" keyword allowed!',
    functionName: 'repeat',
    constraints: ['for'],
    testCases: [
      { id: 'tc1', description: 'repeat("ha", 3) should return "hahaha"', input: ['ha', 3], expectedOutput: 'hahaha', isHidden: false },
      { id: 'tc2', description: 'repeat("ab", 2) should return "abab"', input: ['ab', 2], expectedOutput: 'abab', isHidden: false },
      { id: 'tc3', description: 'repeat("x", 0) should return ""', input: ['x', 0], expectedOutput: '', isHidden: true },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 5: Micro-Project
  {
    id: 'loop-l5-1',
    topicId: 'loops',
    level: 5,
    levelType: 'micro-project',
    title: 'FizzBuzz',
    description: 'Build a function called fizzBuzz that takes n and returns an array from 1 to n where: multiples of 3 are "Fizz", multiples of 5 are "Buzz", multiples of both are "FizzBuzz", others are the number.',
    functionName: 'fizzBuzz',
    projectRequirements: ['Numbers are correct', 'Fizz on multiples of 3', 'Buzz on multiples of 5', 'FizzBuzz on multiples of 15', 'Returns array'],
    testCases: [
      { id: 'tc1', description: 'fizzBuzz(5) should return [1,2,"Fizz",4,"Buzz"]', input: [5], expectedOutput: [1,2,'Fizz',4,'Buzz'], isHidden: false },
      { id: 'tc2', description: 'fizzBuzz(15)[14] should be "FizzBuzz"', input: [15], expectedOutput: [1,2,'Fizz',4,'Buzz','Fizz',7,8,'Fizz','Buzz',11,'Fizz',13,14,'FizzBuzz'], isHidden: false },
    ],
    difficulty: 'medium',
    order: 1,
  },

  // ═══ FUNCTIONS ═══
  // Level 1: Syntax
  {
    id: 'fn-l1-1',
    topicId: 'functions',
    level: 1,
    levelType: 'syntax',
    title: 'Arrow Function',
    description: 'Create an arrow function called multiply that takes two numbers and returns their product.',
    functionName: 'multiply',
    testCases: [
      { id: 'tc1', description: 'multiply(3, 4) should return 12', input: [3, 4], expectedOutput: 12, isHidden: false },
      { id: 'tc2', description: 'multiply(0, 5) should return 0', input: [0, 5], expectedOutput: 0, isHidden: false },
      { id: 'tc3', description: 'multiply(-2, 3) should return -6', input: [-2, 3], expectedOutput: -6, isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 2: Multi-Path
  {
    id: 'fn-l2-1',
    topicId: 'functions',
    level: 2,
    levelType: 'multi-path',
    title: 'Find Maximum',
    description: 'Create a function called findMax that takes an array of numbers and returns the largest one. Find 3 different ways!',
    functionName: 'findMax',
    requiredSolutions: 3,
    testCases: [
      { id: 'tc1', description: 'findMax([1,5,3]) should return 5', input: [[1,5,3]], expectedOutput: 5, isHidden: false },
      { id: 'tc2', description: 'findMax([-1,-5,-3]) should return -1', input: [[-1,-5,-3]], expectedOutput: -1, isHidden: false },
      { id: 'tc3', description: 'findMax([42]) should return 42', input: [[42]], expectedOutput: 42, isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 3: Error Navigation
  {
    id: 'fn-l3-1',
    topicId: 'functions',
    level: 3,
    levelType: 'error-navigation',
    title: 'Fix the Callback',
    description: 'This function uses a callback but has bugs. Find and fix them!',
    functionName: 'applyToAll',
    starterCode: `function applyToAll(arr, callback) {
  let result = [];
  for (let i = 0; i <= arr.length; i++) {
    result.push(callback(arr[i]));
  }
  return results;
}`,
    testCases: [
      { id: 'tc1', description: 'applyToAll([1,2,3], x => x*2) should return [2,4,6]', input: null, expectedOutput: [2,4,6], isHidden: false },
      { id: 'tc2', description: 'applyToAll([10,20], x => x+1) should return [11,21]', input: null, expectedOutput: [11,21], isHidden: false },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 4: Constraint
  {
    id: 'fn-l4-1',
    topicId: 'functions',
    level: 4,
    levelType: 'constraint',
    title: 'No Return Keyword',
    description: 'Create a function called add that takes two numbers and gives back their sum. Constraint: NO "return" keyword allowed!',
    functionName: 'add',
    constraints: ['return'],
    testCases: [
      { id: 'tc1', description: 'add(2, 3) should return 5', input: [2, 3], expectedOutput: 5, isHidden: false },
      { id: 'tc2', description: 'add(-1, 1) should return 0', input: [-1, 1], expectedOutput: 0, isHidden: false },
    ],
    difficulty: 'hard',
    order: 1,
  },
  // Level 5: Micro-Project
  {
    id: 'fn-l5-1',
    topicId: 'functions',
    level: 5,
    levelType: 'micro-project',
    title: 'String Toolkit',
    description: 'Build a function called stringTool that takes a string and a command ("upper", "lower", "reverse", "count", "first"). Return the transformed result.',
    functionName: 'stringTool',
    projectRequirements: ['"upper" uppercases the string', '"lower" lowercases', '"reverse" reverses', '"count" returns length', '"first" returns first char'],
    testCases: [
      { id: 'tc1', description: 'stringTool("hello", "upper") should return "HELLO"', input: ['hello', 'upper'], expectedOutput: 'HELLO', isHidden: false },
      { id: 'tc2', description: 'stringTool("WORLD", "lower") should return "world"', input: ['WORLD', 'lower'], expectedOutput: 'world', isHidden: false },
      { id: 'tc3', description: 'stringTool("abc", "reverse") should return "cba"', input: ['abc', 'reverse'], expectedOutput: 'cba', isHidden: false },
      { id: 'tc4', description: 'stringTool("test", "count") should return 4', input: ['test', 'count'], expectedOutput: 4, isHidden: false },
      { id: 'tc5', description: 'stringTool("hello", "first") should return "h"', input: ['hello', 'first'], expectedOutput: 'h', isHidden: true },
    ],
    difficulty: 'medium',
    order: 1,
  },

  // ═══ ARRAYS ═══
  // Level 1: Syntax
  {
    id: 'arr-l1-1',
    topicId: 'arrays',
    level: 1,
    levelType: 'syntax',
    title: 'Array Sum',
    description: 'Create a function called arraySum that takes an array of numbers and returns their sum.',
    functionName: 'arraySum',
    testCases: [
      { id: 'tc1', description: 'arraySum([1,2,3]) should return 6', input: [[1,2,3]], expectedOutput: 6, isHidden: false },
      { id: 'tc2', description: 'arraySum([10,20,30]) should return 60', input: [[10,20,30]], expectedOutput: 60, isHidden: false },
      { id: 'tc3', description: 'arraySum([]) should return 0', input: [[]], expectedOutput: 0, isHidden: true },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 2: Multi-Path
  {
    id: 'arr-l2-1',
    topicId: 'arrays',
    level: 2,
    levelType: 'multi-path',
    title: 'Filter Even Numbers',
    description: 'Create a function called filterEvens that takes an array of numbers and returns only the even ones. Find 3 different ways!',
    functionName: 'filterEvens',
    requiredSolutions: 3,
    testCases: [
      { id: 'tc1', description: 'filterEvens([1,2,3,4,5,6]) should return [2,4,6]', input: [[1,2,3,4,5,6]], expectedOutput: [2,4,6], isHidden: false },
      { id: 'tc2', description: 'filterEvens([1,3,5]) should return []', input: [[1,3,5]], expectedOutput: [], isHidden: false },
    ],
    difficulty: 'easy',
    order: 1,
  },
  // Level 3: Error Navigation
  {
    id: 'arr-l3-1',
    topicId: 'arrays',
    level: 3,
    levelType: 'error-navigation',
    title: 'Fix the Array Methods',
    description: 'This function should double all numbers and filter out ones greater than 10, but it has bugs.',
    functionName: 'doubleAndFilter',
    starterCode: `function doubleAndFilter(arr) {
  let doubled = arr.map(x => x * 2);
  let filtered = doubled.filter(x => x > 10);
  return filtered;
}`,
    testCases: [
      { id: 'tc1', description: 'doubleAndFilter([1,3,5,7]) should return [2,6]', input: [[1,3,5,7]], expectedOutput: [2,6], isHidden: false },
      { id: 'tc2', description: 'doubleAndFilter([6,7,8]) should return []', input: [[6,7,8]], expectedOutput: [], isHidden: false },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 4: Constraint
  {
    id: 'arr-l4-1',
    topicId: 'arrays',
    level: 4,
    levelType: 'constraint',
    title: 'No Array Methods',
    description: 'Create a function called includes that takes an array and a value, returns true if the value is in the array. Constraint: NO built-in array methods (.includes, .indexOf, .find, .filter, .some)!',
    functionName: 'includes',
    constraints: ['.includes', '.indexOf', '.find', '.filter', '.some'],
    testCases: [
      { id: 'tc1', description: 'includes([1,2,3], 2) should return true', input: [[1,2,3], 2], expectedOutput: true, isHidden: false },
      { id: 'tc2', description: 'includes([1,2,3], 5) should return false', input: [[1,2,3], 5], expectedOutput: false, isHidden: false },
      { id: 'tc3', description: 'includes([], 1) should return false', input: [[], 1], expectedOutput: false, isHidden: true },
    ],
    difficulty: 'medium',
    order: 1,
  },
  // Level 5: Micro-Project
  {
    id: 'arr-l5-1',
    topicId: 'arrays',
    level: 5,
    levelType: 'micro-project',
    title: 'Mini Shopping Cart',
    description: 'Build a function called cartTotal that takes an array of items (objects with name, price, quantity) and returns the total cost.',
    functionName: 'cartTotal',
    projectRequirements: ['Calculates price * quantity per item', 'Sums all items', 'Handles empty cart', 'Returns a number'],
    testCases: [
      { id: 'tc1', description: 'Single item cart', input: [[{name:"Shirt",price:200,quantity:2}]], expectedOutput: 400, isHidden: false },
      { id: 'tc2', description: 'Multiple items', input: [[{name:"A",price:10,quantity:1},{name:"B",price:20,quantity:3}]], expectedOutput: 70, isHidden: false },
      { id: 'tc3', description: 'Empty cart', input: [[]], expectedOutput: 0, isHidden: false },
    ],
    difficulty: 'medium',
    order: 1,
  },
];

// ─── Seed Function ───────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Seed topics
  for (const topic of topics) {
    const { id, ...data } = topic;
    await setDoc(doc(db, 'quiz_topics', id), data);
    console.log(`  ✅ Topic: ${topic.title}`);
  }

  console.log('');

  // Seed problems — stringify nested arrays to avoid Firestore limitation
  for (const problem of problems) {
    const { id, ...data } = problem;
    // Serialize test case input/expectedOutput as JSON strings
    if (data.testCases) {
      data.testCases = data.testCases.map(tc => ({
        ...tc,
        input: JSON.stringify(tc.input),
        expectedOutput: JSON.stringify(tc.expectedOutput),
      }));
    }
    await setDoc(doc(db, 'quiz_problems', id), data);
    console.log(`  ✅ Problem: [${problem.topicId} L${problem.level}] ${problem.title}`);
  }

  console.log(`\n🎉 Done! Seeded ${topics.length} topics and ${problems.length} problems.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
