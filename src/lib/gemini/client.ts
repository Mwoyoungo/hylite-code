import { GoogleGenerativeAI } from '@google/generative-ai';
import { QUANTUM_SYSTEM_PROMPT } from './system-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: QUANTUM_SYSTEM_PROMPT,
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
});
