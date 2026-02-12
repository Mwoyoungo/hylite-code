'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { editor as MonacoEditorType } from 'monaco-editor';
import { Loader2, AlertTriangle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/firebase/get-auth-header';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const EDITOR_OPTIONS: MonacoEditorType.IStandaloneEditorConstructionOptions = {
  fontSize: 15,
  lineHeight: 22,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  minimap: { enabled: false },
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  automaticLayout: true,
  tabSize: 2,
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  padding: { top: 12 },
};

interface CollaborativeCodeEditorProps {
  roomId: string;
  userId: string;
  userName: string;
  readOnly?: boolean;
}

export default function CollaborativeCodeEditor({
  roomId,
  userId,
  userName,
  readOnly = false,
}: CollaborativeCodeEditorProps) {
  const [connected, setConnected] = useState(false);
  const [liveblocksAvailable, setLiveblocksAvailable] = useState<boolean | null>(null);
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const ydocRef = useRef<InstanceType<typeof import('yjs').Doc> | null>(null);
  const providerRef = useRef<unknown>(null);
  const leaveRef = useRef<(() => void) | null>(null);

  // Check if Liveblocks is configured by probing the auth endpoint
  useEffect(() => {
    let cancelled = false;
    async function checkLiveblocks() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/liveblocks/auth', {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, userName, roomId }),
        });
        if (cancelled) return;
        // 500 with "not configured" means Liveblocks keys aren't set
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.error?.includes('not configured') || data?.error?.includes('LIVEBLOCKS')) {
            setLiveblocksAvailable(false);
            return;
          }
        }
        setLiveblocksAvailable(true);
      } catch {
        if (!cancelled) setLiveblocksAvailable(false);
      }
    }
    checkLiveblocks();
    return () => { cancelled = true; };
  }, [userId, userName, roomId]);

  // Connect to Liveblocks + Yjs when available
  useEffect(() => {
    if (liveblocksAvailable !== true) return;

    let cleanup: (() => void) | undefined;

    async function connectCollab() {
      const { createClient } = await import('@liveblocks/client');
      const Y = await import('yjs');
      const { LiveblocksYjsProvider } = await import('@liveblocks/yjs');

      const client = createClient({
        authEndpoint: async () => {
          const headers = await getAuthHeaders();
          const res = await fetch('/api/liveblocks/auth', {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId, userName, roomId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Auth failed');
          return data;
        },
      });

      const { room, leave } = client.enterRoom(roomId, {
        initialPresence: {},
      });

      leaveRef.current = leave;

      const ydoc = new Y.Doc();
      const provider = new LiveblocksYjsProvider(room, ydoc);

      ydocRef.current = ydoc;
      providerRef.current = provider;
      setConnected(true);

      cleanup = () => {
        provider.destroy();
        ydoc.destroy();
        leave();
      };
    }

    connectCollab().catch((err) => {
      console.error('Failed to connect collaborative editor:', err);
      setLiveblocksAvailable(false);
    });

    return () => cleanup?.();
  }, [roomId, liveblocksAvailable]);

  const handleEditorDidMount = async (editor: MonacoEditorType.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    if (!ydocRef.current || !providerRef.current) return;

    const yText = ydocRef.current.getText('monaco');

    try {
      const yMonaco = await import('y-monaco');
      new yMonaco.MonacoBinding(
        yText,
        editor.getModel()!,
        new Set([editor]),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (providerRef.current as any)?.awareness as any
      );
    } catch (err) {
      console.error('y-monaco binding error:', err);
    }
  };

  // Still checking Liveblocks availability
  if (liveblocksAvailable === null) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary">
        <Loader2 size={20} className="animate-spin text-text-muted" />
        <span className="ml-2 text-[12px] font-mono text-text-muted">Connecting to editor...</span>
      </div>
    );
  }

  // Liveblocks not configured — fall back to standalone Monaco editor
  if (!liveblocksAvailable) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 h-[32px] px-3 bg-yellow-500/10 border-b border-yellow-500/20 flex-shrink-0">
          <AlertTriangle size={12} className="text-yellow-500" />
          <span className="text-[11px] font-mono text-yellow-500">
            Collaborative editing not configured — editing locally only
          </span>
        </div>
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          defaultValue="// Write your code here\n"
          options={{ ...EDITOR_OPTIONS, readOnly, domReadOnly: readOnly }}
        />
      </div>
    );
  }

  // Liveblocks available but Yjs not yet connected
  if (!connected) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary">
        <Loader2 size={20} className="animate-spin text-text-muted" />
        <span className="ml-2 text-[12px] font-mono text-text-muted">Connecting to editor...</span>
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language="javascript"
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{ ...EDITOR_OPTIONS, readOnly, domReadOnly: readOnly }}
    />
  );
}
