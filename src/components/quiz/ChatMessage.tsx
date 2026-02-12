'use client';

import { Bot, User, Info } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-start gap-2 px-4 py-2.5 mx-3 my-2 bg-accent/10 border border-accent/20 rounded-sm">
        <Info size={15} className="text-accent mt-0.5 flex-shrink-0" />
        <span className="text-[13px] text-accent font-mono">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${isUser ? 'bg-bg-active/30' : ''}`}>
      <div
        className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full text-base"
        style={{
          backgroundColor: isUser ? '#007acc25' : '#4ec9b020',
          border: `1px solid ${isUser ? '#007acc40' : '#4ec9b040'}`,
        }}
      >
        {isUser ? '🧑‍💻' : '🤖'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] mb-1 font-mono font-semibold" style={{ color: isUser ? '#9cdcfe' : '#4ec9b0' }}>
          {isUser ? 'You' : 'Quantum AI'}
        </div>
        <div className="text-[14px] text-text-primary leading-relaxed font-mono whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}
