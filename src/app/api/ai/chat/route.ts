import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini/client';
import { buildChatContext } from '@/lib/gemini/context-builder';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const contextMessage = buildChatContext({
      topic: body.topic,
      levelType: body.levelType,
      level: body.level,
      problemTitle: body.problemTitle,
      problemDescription: body.problemDescription,
      studentCode: body.studentCode || '',
      attemptNumber: body.attemptNumber || 0,
      constraints: body.constraints,
      chatHistory: body.chatHistory || [],
      userMessage: body.userMessage,
    });

    const prompt = `${contextMessage}\n\n---\n\nRespond to the student's message following the Quantum Framework guidelines. Be conversational, encouraging, and concise. Do NOT respond with JSON — respond naturally as the AI tutor.`;

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
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
