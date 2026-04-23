'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useSignInGate } from '@/hooks/useSignInGate';

const THUMBS = [
  { label: 'japandi', src: '/hero/after-japandi.webp' },
  { label: 'scandi', src: '/hero/after-scandinavian.webp' },
  { label: 'minimalist', src: '/hero/after-minimalist.webp' },
  { label: 'high-tech', src: '/hero/after-high-tech.webp' },
];

export function Hero() {
  const gate = useSignInGate();

  return (
    <section className="border-b border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.2fr_1fr]">
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-warm">
            One photo · many styles
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Design Your Space with
            <br />
            <span className="italic font-normal text-accent-warm">
              AI-Powered Simplicity
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Upload a photo of any room and let our AI redesign it to match your
            preferred style — new look, new mood, and instant results.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:mt-auto lg:pt-9">
            <Link
              href="/spaces"
              onClick={(e) => gate('/spaces', e)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Designing
            </Link>
            <Link
              href="#styles"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              View Gallery
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="grid grid-cols-2 gap-3"
        >
          <HeroTile
            label="your room · before"
            src="/hero/before-original.webp"
            className="col-span-2 h-[220px] w-full"
            tone="neutral"
          />
          {THUMBS.map((t) => (
            <HeroTile
              key={t.label}
              label={t.label}
              src={t.src}
              className="h-[140px] w-full"
              tone={t.label === 'japandi' ? 'warm' : 'neutral'}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HeroTile({
  src,
  label,
  className,
  tone,
}: {
  src?: string;
  label: string;
  className?: string;
  tone: 'warm' | 'neutral';
}) {
  const [failed, setFailed] = useState(!src);
  const gradient =
    tone === 'warm'
      ? 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--accent-warm) 35%, var(--muted)) 0 12px, var(--muted) 12px 24px)'
      : 'repeating-linear-gradient(135deg, var(--muted) 0 12px, var(--border) 12px 24px)';

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border ${className ?? ''}`}
      style={failed ? { backgroundImage: gradient } : undefined}
    >
      {!failed && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <span className="absolute bottom-2 left-2 rounded bg-background/75 px-2 py-1 font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
