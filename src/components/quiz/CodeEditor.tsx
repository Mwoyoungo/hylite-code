'use client';

import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={(val) => onChange(val || '')}
      options={{
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
        readOnly,
        domReadOnly: readOnly,
      }}
    />
  );
}
