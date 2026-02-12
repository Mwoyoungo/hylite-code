import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini/client';
import { buildAssessmentContext } from '@/lib/gemini/context-builder';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const contextMessage = buildAssessmentContext({
      topic: body.topic,
      levelType: body.levelType,
      level: body.level,
      problemTitle: body.problemTitle,
      problemDescription: body.problemDescription,
      testCases: body.testCases || [],
      studentCode: body.studentCode,
      attemptNumber: body.attemptNumber,
      testResults: body.testResults || [],
      constraints: body.constraints,
      requiredSolutions: body.requiredSolutions,
      submittedSolutions: body.submittedSolutions,
      chatHistory: body.chatHistory || [],
    });

    const prompt = `${contextMessage}\n\n---\n\nThe student has submitted their code for assessment. Please assess their code following the Quantum Framework guidelines for Level ${body.level} (${body.levelType}). Respond with your assessment in the JSON format specified in the system prompt, wrapped in a \`\`\`json code block.`;

    const chat = geminiModel.startChat({});

    const result = await chat.sendMessageStream(prompt);

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('AI assess error:', error);
    return NextResponse.json(
      { error: 'Failed to assess code' },
      { status: 500 }
    );
  }
}
