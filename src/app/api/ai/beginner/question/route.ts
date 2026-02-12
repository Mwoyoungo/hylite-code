import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildBeginnerQuestionContext } from '@/lib/gemini/beginner-context-builder';
import { BEGINNER_SYSTEM_PROMPT } from '@/lib/gemini/beginner-system-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function extractJSON(raw: string): string {
  let text = raw.trim();

  // Strip markdown fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1].trim();

  // Extract JSON object if there's extra text
  if (!text.startsWith('{')) {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) text = objMatch[0];
  }

  // Validate
  JSON.parse(text);
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const contextMessage = buildBeginnerQuestionContext({
      topicId: body.topicId,
      topicTitle: body.topicTitle,
      cumulativeTopics: body.cumulativeTopics || [],
      difficulty: body.difficulty || 'easy',
      questionIndex: body.questionIndex || 0,
      previousQuestions: body.previousQuestions || [],
    });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: BEGINNER_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // Retry up to 3 times if Gemini returns non-JSON
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const chat = model.startChat({});
        const result = await chat.sendMessage(contextMessage);
        const rawText = result.response.text();
        const jsonText = extractJSON(rawText);

        return new Response(jsonText, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        lastError = err;
        console.error(`Question generation attempt ${attempt}/3 failed:`, err instanceof Error ? err.message : err);
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Beginner question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
