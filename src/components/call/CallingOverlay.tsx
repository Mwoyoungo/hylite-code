'use client';

import { useEffect, useState } from 'react';
import { Phone, X, Loader2 } from 'lucide-react';

interface CallingOverlayProps {
  tutorName: string;
  topicName: string;
  onCancel: () => void;
  status: string | null;
}

export default function CallingOverlay({ tutorName, topicName, onCancel, status }: CallingOverlayProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ─── Tutor accepted, connecting to room ─────────
  if (status === 'accepted') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[360px] text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute w-16 h-16 rounded-full bg-accent/20 animate-pulse" />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-accent">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-base font-mono font-bold text-text-bright mb-1">
            {tutorName} accepted
          </h2>
          <p className="text-[12px] font-mono text-text-secondary">
            Connecting to call...
          </p>
        </div>
      </div>
    );
  }

  // ─── Call declined ────────────────────────────────
  if (status === 'declined') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[360px] text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-error/15 border border-error/20">
              <Phone size={24} className="text-error" />
            </div>
          </div>
          <h2 className="text-base font-mono font-bold text-text-bright mb-1">Call Declined</h2>
          <p className="text-[12px] font-mono text-text-secondary mb-4">
            {tutorName} is unavailable. Try another tutor.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-input hover:bg-bg-hover text-text-primary text-[13px] font-mono border border-border rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── No answer (timeout) ─────────────────────────
  if (status === 'missed') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[360px] text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-warning/15 border border-warning/20">
              <Phone size={24} className="text-warning" />
            </div>
          </div>
          <h2 className="text-base font-mono font-bold text-text-bright mb-1">No Answer</h2>
          <p className="text-[12px] font-mono text-text-secondary mb-4">
            {tutorName} didn&apos;t pick up. Try again or choose another tutor.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-input hover:bg-bg-hover text-text-primary text-[13px] font-mono border border-border rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Call cancelled ──────────────────────────────
  if (status === 'cancelled') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[360px] text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-text-muted/15 border border-text-muted/20">
              <X size={24} className="text-text-muted" />
            </div>
          </div>
          <h2 className="text-base font-mono font-bold text-text-bright mb-1">Call Cancelled</h2>
          <p className="text-[12px] font-mono text-text-secondary mb-4">
            The call was cancelled.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-input hover:bg-bg-hover text-text-primary text-[13px] font-mono border border-border rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Call ended ───────────────────────────────────
  if (status === 'ended') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[360px] text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-text-muted/15 border border-text-muted/20">
              <Phone size={24} className="text-text-muted" />
            </div>
          </div>
          <h2 className="text-base font-mono font-bold text-text-bright mb-1">Call Ended</h2>
          <p className="text-[12px] font-mono text-text-secondary mb-4">
            The call has ended.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-input hover:bg-bg-hover text-text-primary text-[13px] font-mono border border-border rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Default: Ringing ─────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border rounded-lg p-8 w-[360px] text-center">
        {/* Ringing animation */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute w-20 h-20 rounded-full bg-teal/20 animate-ping" />
          <div className="absolute w-16 h-16 rounded-full bg-teal/30 animate-pulse" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-teal">
            <Phone size={24} className="text-white" />
          </div>
        </div>

        <h2 className="text-base font-mono font-bold text-text-bright mb-1">
          Calling {tutorName}{dots}
        </h2>
        <p className="text-[12px] font-mono text-text-secondary mb-1">
          Topic: {topicName}
        </p>
        <p className="text-[11px] font-mono text-text-muted mb-6">
          Waiting for tutor to accept
        </p>

        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-error/15 hover:bg-error/25 text-error text-[13px] font-mono border border-error/20 rounded transition-colors"
        >
          <X size={14} />
          Cancel Call
        </button>
      </div>
    </div>
  );
}
