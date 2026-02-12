'use client';

import { FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ProblemStatementProps {
  title: string;
  description: string;
  level: number;
  levelType: string;
}

export default function ProblemStatement({ title, description, level, levelType }: ProblemStatementProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-bg-secondary border-b border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-bg-hover transition-colors text-left"
      >
        {collapsed ? (
          <ChevronRight size={15} className="text-text-muted" />
        ) : (
          <ChevronDown size={15} className="text-text-muted" />
        )}
        <FileText size={15} className="text-accent" />
        <span className="text-[14px] font-mono text-text-bright">{title}</span>
        <span className="text-[12px] font-mono text-text-secondary ml-auto">
          L{level} · {levelType}
        </span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-3 text-[14px] text-text-primary font-mono leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}
