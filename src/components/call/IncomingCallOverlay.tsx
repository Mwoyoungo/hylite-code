'use client';

import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, BookOpen } from 'lucide-react';
import type { CallDocument } from '@/lib/types';

interface IncomingCallOverlayProps {
  call: CallDocument;
  onAccept: (call: CallDocument) => void;
  onDecline: (call: CallDocument) => void;
}

export default function IncomingCallOverlay({ call, onAccept, onDecline }: IncomingCallOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play ringing sound
    const audio = new Audio('/sounds/ring.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleAccept = () => {
    audioRef.current?.pause();
    onAccept(call);
  };

  const handleDecline = () => {
    audioRef.current?.pause();
    onDecline(call);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[380px] text-center shadow-2xl">
        {/* Ringing animation */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute w-20 h-20 rounded-full bg-teal/20 animate-ping" />
          <div className="absolute w-16 h-16 rounded-full bg-teal/30 animate-pulse" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-teal">
            <Phone size={24} className="text-white animate-bounce" />
          </div>
        </div>

        <h2 className="text-base font-mono font-bold text-text-bright mb-1">
          Incoming Call
        </h2>
        <p className="text-[14px] font-mono text-text-primary mb-1">
          {call.studentName}
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <BookOpen size={12} className="text-teal" />
          <span className="text-[12px] font-mono text-text-secondary">
            Topic: {call.topicId}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-error/15 hover:bg-error/25 text-error text-[13px] font-mono border border-error/20 rounded-lg transition-colors"
          >
            <PhoneOff size={16} />
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal hover:bg-teal/80 text-white text-[13px] font-mono rounded-lg transition-colors"
          >
            <Phone size={16} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
