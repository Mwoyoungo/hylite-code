import { GoogleGenerativeAI } from '@google/generative-ai';
import { BEGINNER_SYSTEM_PROMPT } from './beginner-system-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const beginnerGeminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: BEGINNER_SYSTEM_PROMPT,
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
    responseMimeType: 'application/json',
  },
});
