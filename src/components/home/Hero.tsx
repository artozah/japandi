'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSignInGate } from '@/hooks/useSignInGate';

const STATS = [
  { value: '10k+', label: 'rooms redesigned' },
  { value: '36', label: 'design styles' },
  { value: '~8s', label: 'per render' },
];

export function Hero() {
  const gate = useSignInGate();

  return (
    <section className="border-b border-border px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-warm">
            Interior · AI · Instant
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4rem]">
            Design Your Space with
            <br />
            <span className="text-muted-foreground">AI-Powered Simplicity</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Upload a photo of any room and let our AI redesign it to match your
            preferred style — new look, new mood, and instant results.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
              See Examples
            </Link>
          </div>

          <dl className="mt-10 flex gap-7 font-mono text-xs text-muted-foreground">
            {STATS.map((s) => (
              <div key={s.label}>
                <dd className="block font-sans text-2xl font-semibold text-accent-warm">
                  {s.value}
                </dd>
                <dt className="mt-0.5">{s.label}</dt>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <BeforeAfterSlider />
        </motion.div>
      </div>
    </section>
  );
}

function BeforeAfterSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100),
    );
    setPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [updateFromClientX]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
  };

  return (
    <div
      ref={trackRef}
      className="relative aspect-[4/5] select-none overflow-hidden rounded-xl border border-border"
      onPointerDown={(e) => {
        dragging.current = true;
        trackRef.current?.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
    >
      <HeroImage src="/hero/before-original.webp" label="before · as-shot" tone="neutral" />

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        <HeroImage src="/hero/after-japandi.webp" label="after · japandi" tone="warm" />
      </div>

      <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-xs text-foreground backdrop-blur">
        Before
      </span>
      <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-xs text-foreground backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-warm" />
        After · Japandi
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground/90"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
      />

      <button
        type="button"
        role="slider"
        aria-label="Reveal redesign"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={onKey}
        className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-foreground text-background shadow-[0_4px_16px_rgba(0,0,0,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-warm"
        style={{ left: `${pos}%` }}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
          trackRef.current?.setPointerCapture(e.pointerId);
        }}
      >
        <DragIcon />
      </button>
    </div>
  );
}

function DragIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3v18M3 12h18M5 5h4M5 19h4M15 5h4M15 19h4" />
    </svg>
  );
}

function HeroImage({
  src,
  label,
  tone,
}: {
  src: string;
  label: string;
  tone: 'neutral' | 'warm';
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const gradient =
      tone === 'warm'
        ? 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--accent-warm) 35%, var(--muted)) 0 12px, var(--muted) 12px 24px)'
        : 'repeating-linear-gradient(135deg, var(--muted) 0 12px, var(--border) 12px 24px)';
    return (
      <div className="absolute inset-0" style={{ backgroundImage: gradient }}>
        <span className="absolute bottom-3 left-3 rounded bg-background/75 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          {label}
        </span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={label}
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
