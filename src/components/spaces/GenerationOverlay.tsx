import { cn } from '@/lib/utils';

interface GenerationOverlayProps {
  percentage?: number;
  size?: 'sm' | 'md';
  variant?: 'progress' | 'preparing';
  className?: string;
}

export function GenerationOverlay({
  percentage = 0,
  size = 'md',
  variant = 'progress',
  className,
}: GenerationOverlayProps) {
  const dims = size === 'sm' ? 32 : 48;
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  if (variant === 'preparing') {
    return (
      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 backdrop-blur-[1px]',
          className,
        )}
      >
        <div
          className="animate-spin rounded-full border-2 border-white/20 border-t-white"
          style={{ width: dims, height: dims }}
        />
        <span
          className={cn(
            'font-medium text-white/90 tabular-nums',
            textSize,
          )}
        >
          Preparing…
        </span>
      </div>
    );
  }

  const stroke = size === 'sm' ? 3 : 4;
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference * (1 - Math.max(0, Math.min(100, percentage)) / 100);

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]',
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
    </div>
  );
}
