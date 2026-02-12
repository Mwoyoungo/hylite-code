import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildBeginnerEvaluationContext } from '@/lib/gemini/beginner-context-builder';
import { BEGINNER_SYSTEM_PROMPT } from '@/lib/gemini/beginner-system-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function extractJSON(raw: string): string {
  let text = raw.trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1].trim();

  if (!text.startsWith('{')) {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) text = objMatch[0];
  }

  JSON.parse(text);
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const contextMessage = buildBeginnerEvaluationContext({
      question: body.question,
      functionName: body.functionName,
      testCases: body.testCases || [],
      studentCode: body.studentCode || '',
      attemptNumber: body.attemptNumber || 1,
    });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: BEGINNER_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    });

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
        console.error(`Evaluation attempt ${attempt}/3 failed:`, err instanceof Error ? err.message : err);
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Beginner evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate code' },
      { status: 500 }
    );
  }
}
