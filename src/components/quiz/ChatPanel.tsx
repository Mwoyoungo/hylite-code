'use client';

import { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatPanelProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatPanel({ messages, onSendMessage, isLoading = false }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      <div className="flex items-center gap-2 h-[38px] px-3 border-b border-border bg-bg-tertiary flex-shrink-0">
        <span className="text-base">🤖</span>
        <span className="text-[13px] text-teal font-mono uppercase tracking-wider font-semibold">AI Tutor</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[12px] font-mono text-text-secondary">online</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted px-8">
            <div className="text-5xl mb-3">🎯</div>
            <p className="text-[15px] text-center text-text-secondary">Your AI tutor is ready to help!</p>
            <p className="text-[13px] text-center mt-1 text-text-muted">Write some code and submit to get personalized feedback.</p>
            <div className="flex gap-2 mt-4">
              <span className="px-2.5 py-1 bg-teal/10 border border-teal/20 text-teal text-[12px] font-mono rounded-sm">hints</span>
              <span className="px-2.5 py-1 bg-purple/10 border border-purple/20 text-purple text-[12px] font-mono rounded-sm">guidance</span>
              <span className="px-2.5 py-1 bg-orange/10 border border-orange/20 text-orange text-[12px] font-mono rounded-sm">encouragement</span>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full text-base bg-teal/10 border border-teal/20">
                  🤖
                </div>
                <div className="flex gap-1.5 mt-2.5">
                  <div className="w-2.5 h-2.5 bg-teal/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-purple/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-orange/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput onSend={onSendMessage} disabled={isLoading} placeholder="Ask me anything... I'm here to help! 😊" />
    </div>
  );
}
