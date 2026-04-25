'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Rearranging furniture...',
  'Consulting feng shui...',
  'Mixing paint colors...',
  'Fluffing the pillows...',
  'Adjusting the lighting...',
  'Debating accent walls...',
  'Picking the perfect rug...',
  'Hanging abstract art...',
  'Brewing design ideas...',
  'Polishing the floors...',
  'Measuring twice...',
  'Asking the plants...',
  'Aligning the chakras...',
  'Ironing the curtains...',
  'Staging the vignette...',
  'Choosing throw blankets...',
  'Tuning the color palette...',
  'Rethinking the layout...',
  'Texturing the walls...',
  'Scouting vintage shops...',
  'Warming up the tones...',
  'Dusting off the mantle...',
  'Placing the candles...',
  'Balancing the symmetry...',
  'Adding a touch of wabi-sabi...',
];

function pickRandom(exclude: number): number {
  let next: number;
  do {
    next = Math.floor(Math.random() * STATUS_MESSAGES.length);
  } while (next === exclude && STATUS_MESSAGES.length > 1);
  return next;
}

function useRotatingMessage(enabled: boolean) {
  const [index, setIndex] = useState(() => pickRandom(-1));

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setIndex((current) => pickRandom(current));
    }, 5_000);
    return () => clearInterval(id);
  }, [enabled]);

  return enabled ? STATUS_MESSAGES[index] : null;
}

interface GenerationOverlayProps {
  percentage?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function GenerationOverlay({
  percentage = 0,
  size = 'md',
  className,
}: GenerationOverlayProps) {
  const dims = size === 'sm' ? 32 : 48;
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[11px]';
  const stroke = size === 'sm' ? 3 : 4;
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference * (1 - Math.max(0, Math.min(100, percentage)) / 100);

  const message = useRotatingMessage(size === 'md');

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[1px]',
        className,
      )}
    >
      <div className="relative" style={{ width: dims, height: dims }}>
        <svg
          width={dims}
          height={dims}
          viewBox={`0 0 ${dims} ${dims}`}
          className="-rotate-90"
        >
          <circle
            cx={dims / 2}
            cy={dims / 2}
            r={radius}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={dims / 2}
            cy={dims / 2}
            r={radius}
            stroke="white"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 180ms linear' }}
          />
        </svg>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center font-semibold text-white tabular-nums',
            textSize,
          )}
        >
          {Math.round(percentage)}%
        </div>
      </div>
      {size === 'md' && (
        <span className="text-[10px] font-medium text-white/80 transition-opacity duration-300">
          {message}
        </span>
      )}
    </div>
  );
}
