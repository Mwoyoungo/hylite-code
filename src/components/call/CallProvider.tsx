'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useIncomingCalls } from '@/hooks/useIncomingCalls';
import { useCallState } from '@/hooks/useCallState';
import { useTutorPresence } from '@/hooks/useTutorPresence';
import IncomingCallOverlay from './IncomingCallOverlay';
import type { CallDocument } from '@/lib/types';

interface CallContextType {
  incomingCalls: CallDocument[];
}

const CallContext = createContext<CallContextType>({ incomingCalls: [] });

export function useCallContext() {
  return useContext(CallContext);
}

export default function CallProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const isTutor = profile?.role === 'tutor';

  // Tutor presence — sets online/offline status
  useTutorPresence();

  // Listen for incoming calls (tutors only)
  const incomingCalls = useIncomingCalls(isTutor ? user?.uid : undefined);

  const { acceptCall, declineCall } = useCallState({ callId: null });

  const handleAccept = useCallback(async (call: CallDocument) => {
    await acceptCall(call);
    router.push(`/beginner/${call.topicId}/session/${call.sessionId}`);
  }, [acceptCall, router]);

  const handleDecline = useCallback(async (call: CallDocument) => {
    await declineCall(call);
  }, [declineCall]);

  // Show the first incoming call overlay
  const activeIncomingCall = incomingCalls[0] || null;

  return (
    <CallContext.Provider value={{ incomingCalls }}>
      {children}
      {activeIncomingCall && (
        <IncomingCallOverlay
          call={activeIncomingCall}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </CallContext.Provider>
  );
}
