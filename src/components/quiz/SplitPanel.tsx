'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
}

export default function SplitPanel({
  left,
  right,
  defaultLeftWidth = 38,
  minLeftWidth = 20,
  minRightWidth = 30,
}: SplitPanelProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(Math.max(percentage, minLeftWidth), 100 - minRightWidth);
      setLeftWidth(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minLeftWidth, minRightWidth]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div style={{ width: `${leftWidth}%` }} className="h-full overflow-hidden">
        {left}
      </div>
      <div
        className="w-[3px] bg-border hover:bg-accent cursor-col-resize transition-colors flex-shrink-0"
        onMouseDown={handleMouseDown}
      />
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full overflow-hidden">
        {right}
      </div>
    </div>
  );
}
