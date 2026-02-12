'use client';

import { Ban } from 'lucide-react';

interface ConstraintBannerProps {
  constraints: string[];
}

export default function ConstraintBanner({ constraints }: ConstraintBannerProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border-b border-border">
      <Ban size={14} className="text-warning flex-shrink-0" />
      <span className="text-[11px] font-mono text-warning">
        Constraint: Cannot use
      </span>
      <div className="flex items-center gap-1">
        {constraints.map((c) => (
          <span
            key={c}
            className="px-1.5 py-0.5 bg-warning/20 text-warning text-[11px] font-mono border border-warning/30"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
