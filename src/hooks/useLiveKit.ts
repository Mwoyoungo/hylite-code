'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from 'livekit-client';

interface UseLiveKitOptions {
  url: string;
  token: string | null;
  autoConnect?: boolean;
}

export function useLiveKit({ url, token, autoConnect = false }: UseLiveKitOptions) {
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const connect = useCallback(async () => {
    if (!token || !url) return;
    if (roomRef.current?.state === 'connected') return;

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        const audioEl = track.attach();
        audioEl.id = `audio-${participant.identity}`;
        document.body.appendChild(audioEl);
        audioElementsRef.current.set(participant.identity, audioEl);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      track.detach().forEach((el) => el.remove());
      audioElementsRef.current.delete(participant.identity);
    });

    room.on(RoomEvent.Disconnected, () => {
      setConnected(false);
    });

    try {
      await room.connect(url, token);
      roomRef.current = room;
      setConnected(true);
      // Small delay before publishing mic — lets the room finish syncing
      // participants so track additions don't race ahead of participant registration
      setTimeout(async () => {
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch (err) {
          console.error('LiveKit mic enable error:', err);
        }
      }, 500);
    } catch (err) {
      console.error('LiveKit connect error:', err);
    }
  }, [url, token]);

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    // Clean up audio elements
    audioElementsRef.current.forEach((el) => el.remove());
    audioElementsRef.current.clear();
    setConnected(false);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;
    const newMuted = !isMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }
  }, [autoConnect, token, connect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    room: roomRef.current,
    connected,
    isMuted,
    connect,
    disconnect,
    toggleMute,
  };
}
