import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  muted?: boolean;
  width?: string;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  muted,
  width = 'max-w-7xl',
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'border-t border-border px-4 py-24 sm:px-6 sm:py-32 lg:px-8',
        muted && 'bg-muted/30',
        className,
      )}
    >
      <div className={cn('mx-auto', width)}>{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  width?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  width = 'max-w-xl',
}: SectionHeaderProps) {
  return (
    <div className={cn('mx-auto text-center', width)}>
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-warm">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
