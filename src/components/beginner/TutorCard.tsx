'use client';

import { Phone, User } from 'lucide-react';
import type { TutorAvailability } from '@/lib/types';

interface TutorCardProps {
  tutor: TutorAvailability;
  onCall: (tutorId: string) => void;
  disabled?: boolean;
}

export default function TutorCard({ tutor, onCall, disabled }: TutorCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-secondary border border-border rounded-sm hover:border-teal/30 transition-colors">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {tutor.photoURL ? (
          <img
            src={tutor.photoURL}
            alt={tutor.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal/15 border border-teal/20">
            <User size={18} className="text-teal" />
          </div>
        )}
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-bg-secondary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-mono text-text-bright truncate">{tutor.displayName}</p>
        {tutor.specialties.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {tutor.specialties.slice(0, 3).map((s) => (
              <span key={s} className="px-1.5 py-0.5 bg-bg-input text-[10px] font-mono text-text-muted rounded-sm">
                {s}
              </span>
            ))}
          </div>
        )}
        {!tutor.inSession && (
          <span className="text-[11px] font-mono text-success">Available</span>
        )}
        {tutor.inSession && (
          <span className="text-[11px] font-mono text-warning">In session</span>
        )}
      </div>

      {/* Call button */}
      <button
        onClick={() => onCall(tutor.uid)}
        disabled={disabled || tutor.inSession}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal hover:bg-teal/80 text-white text-[12px] font-mono rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Phone size={13} />
        Call
      </button>
    </div>
  );
}
