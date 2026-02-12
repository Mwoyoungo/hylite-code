'use client';

interface QuestionProgressProps {
  total: number;
  current: number;
  results: (boolean | null)[];
}

export default function QuestionProgress({ total, current, results }: QuestionProgressProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const result = results[i];
        const isCurrent = i === current;
        const isPast = i < current;

        let bgColor = '#3c3c3c'; // future — gray
        let borderColor = '#555';

        if (result === true) {
          bgColor = '#4ec9b0'; // passed — teal
          borderColor = '#4ec9b0';
        } else if (result === false) {
          bgColor = '#f44747'; // failed — red
          borderColor = '#f44747';
        } else if (isCurrent) {
          bgColor = '#007acc'; // current — accent blue
          borderColor = '#007acc';
        }

        return (
          <div
            key={i}
            className="relative flex items-center justify-center"
            title={`Question ${i + 1}`}
          >
            <div
              className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                isCurrent ? 'ring-2 ring-accent/40 ring-offset-1 ring-offset-bg-primary' : ''
              }`}
              style={{ backgroundColor: bgColor, borderColor, border: `1.5px solid ${borderColor}` }}
            >
              <span className={result !== null || isCurrent ? 'text-white' : 'text-text-muted'}>
                {result === true ? '✓' : result === false ? '✗' : i + 1}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
