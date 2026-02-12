'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled = false, placeholder = 'Ask the AI tutor...' }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border bg-bg-secondary">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-bg-input text-text-bright text-[14px] font-mono px-3 py-2 resize-none outline-none border border-border focus:border-accent placeholder:text-text-muted rounded-sm"
        style={{ minHeight: '38px', maxHeight: '120px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="flex items-center justify-center w-[38px] h-[38px] bg-accent hover:bg-accent-hover disabled:bg-bg-input disabled:text-text-muted text-white transition-colors rounded-sm"
        title="Send message"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
