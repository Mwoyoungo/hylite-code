'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { updateCall, updateBeginnerSession } from '@/lib/firebase/firestore';
import type { CallDocument, CallStatus } from '@/lib/types';

interface UseCallStateOptions {
  callId: string | null;
  onAccepted?: () => void;
  onDeclined?: () => void;
  onMissed?: () => void;
  onCancelled?: () => void;
  onEnded?: (endedBy: string) => void;
}

export function useCallState({
  callId,
  onAccepted,
  onDeclined,
  onMissed,
  onCancelled,
  onEnded,
}: UseCallStateOptions) {
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [callData, setCallData] = useState<CallDocument | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!callId) return;

    const unsub = onSnapshot(doc(db, 'calls', callId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as CallDocument;
        setCallData(data);
        setCallStatus(data.status);

        if (data.status === 'accepted') {
          // Clear auto-miss timeout once accepted
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          onAccepted?.();
        }
        if (data.status === 'declined') onDeclined?.();
        if (data.status === 'missed') onMissed?.();
        if (data.status === 'cancelled') onCancelled?.();
        if (data.status === 'ended') onEnded?.(data.endedBy || '');
      }
    });

    // Auto-timeout after 30 seconds
    timeoutRef.current = setTimeout(async () => {
      try {
        await updateCall(callId, { status: 'missed' } as Partial<CallDocument>);
      } catch {}
    }, 30000);

    return () => {
      unsub();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [callId, onAccepted, onDeclined, onMissed, onCancelled, onEnded]);

  const cancelCall = useCallback(async () => {
    if (!callId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await updateCall(callId, { status: 'cancelled' } as Partial<CallDocument>);
  }, [callId]);

  const endCall = useCallback(async (userId: string) => {
    if (!callId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await updateCall(callId, {
      status: 'ended',
      endedBy: userId,
    } as Partial<CallDocument>);
  }, [callId]);

  const acceptCall = useCallback(async (call: CallDocument) => {
    await updateCall(call.id, { status: 'accepted' } as Partial<CallDocument>);
    await updateBeginnerSession(call.sessionId, { status: 'teaching' });
  }, []);

  const declineCall = useCallback(async (call: CallDocument) => {
    await updateCall(call.id, { status: 'declined' } as Partial<CallDocument>);
  }, []);

  return {
    callStatus,
    callData,
    cancelCall,
    endCall,
    acceptCall,
    declineCall,
  };
}
