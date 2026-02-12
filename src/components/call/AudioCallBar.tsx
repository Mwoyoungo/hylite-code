'use client';

import { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, PhoneOff } from 'lucide-react';

interface AudioCallBarProps {
  participantName: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  connected: boolean;
}

export default function AudioCallBar({
  participantName,
  isMuted,
  onToggleMute,
  onEndCall,
  connected,
}: AudioCallBarProps) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connected]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 h-[40px] px-4 bg-teal/10 border-b border-teal/20 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Phone size={14} className="text-teal" />
        <span className="text-[12px] font-mono text-teal font-semibold">
          {connected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      <span className="text-[12px] font-mono text-text-secondary">
        with {participantName}
      </span>

      <span className="text-[12px] font-mono text-text-muted">
        {formatDuration(duration)}
      </span>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onToggleMute}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            isMuted
              ? 'bg-error/15 text-error hover:bg-error/25'
              : 'bg-bg-input text-text-primary hover:bg-bg-hover'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
        </button>

        <button
          onClick={onEndCall}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-error/15 hover:bg-error/25 text-error text-[12px] font-mono rounded-full transition-colors"
        >
          <PhoneOff size={13} />
          End
        </button>
      </div>
    </div>
  );
}
