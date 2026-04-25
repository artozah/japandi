'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Section, SectionHeader } from '@/components/home/Section';
import { useSignInGate } from '@/hooks/useSignInGate';

const STYLES = [
  {
    key: 'japandi',
    desc: 'warm wood · linen · calm',
    palette: ['#c9a876', '#8a7a62', '#d8d2c5', '#2b2a27', '#f5f1e8'],
    image: '/images/Japandi_Style.webp',
  },
  {
    key: 'scandi',
    desc: 'pale oak · white · soft',
    palette: ['#d4c8b0', '#e8e2d5', '#b8a890', '#3a3528', '#fafafa'],
    image: '/images/Scandinavian.webp',
  },
  {
    key: 'minimal',
    desc: 'plaster · restraint · air',
    palette: ['#e8e3d8', '#d0c8b8', '#85807a', '#2a2825', '#ffffff'],
    image: '/images/Minimalist.webp',
  },
  {
    key: 'midcentury',
    desc: 'walnut · ochre · geometry',
    palette: ['#8b5a3c', '#d4a052', '#e8ddc4', '#2a1e16', '#c9622e'],
    image: '/images/Mid-Century.webp',
  },
  {
    key: 'industrial',
    desc: 'steel · concrete · leather',
    palette: ['#5a5650', '#8a857d', '#3a3530', '#a06848', '#1e1c1a'],
    image: '/images/Industrial.webp',
  },
  {
    key: 'boho',
    desc: 'rattan · terracotta · layered',
    palette: ['#c46b4a', '#d4a68a', '#8a6a4a', '#5a3a28', '#e8d4b8'],
    image: '/images/Bohemian.webp',
  },
  {
    key: 'coastal',
    desc: 'pale blue · driftwood · open',
    palette: ['#a8c0c8', '#d8d0c0', '#6a8088', '#2a3840', '#f0ede4'],
    image: '/images/Coastal.webp',
  },
  {
    key: 'farmhouse',
    desc: 'oak · cream · texture',
    palette: ['#a08868', '#e8dcc8', '#c4b498', '#3a2e20', '#f5ede0'],
    image: '/images/Rustic.webp',
  },
] as const;

type StyleKey = (typeof STYLES)[number]['key'];

export function StyleGallery() {
  const gate = useSignInGate();
  const [active, setActive] = useState<StyleKey>('japandi');
  const sel = STYLES.find((s) => s.key === active) ?? STYLES[0];

  return (
    <Section id="styles">
      <SectionHeader
        eyebrow="Style library"
        title="One room. Every aesthetic."
        subtitle="Your space, reimagined in 36 curated styles — here are a few to try."
      />

      <div className="mt-12 flex flex-wrap justify-center gap-2">
        {STYLES.map((s) => {
          const on = s.key === active;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                on
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.key}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col rounded-xl border border-border bg-card p-7">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-warm" />
            {sel.key}
          </span>
          <h3 className="mt-5 text-2xl font-semibold capitalize tracking-tight">
            {sel.key}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A considered balance of warmth and restraint — spaces that feel
            lived-in and calm, never staged.
          </p>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Palette
          </p>
          <div className="mt-2 flex gap-1.5">
            {sel.palette.map((c) => (
              <span
                key={c}
                className="h-7 w-7 rounded-full border border-border"
                style={{ background: c }}
              />
            ))}
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Signature
          </p>
          <p className="mt-1 text-sm text-foreground">{sel.desc}</p>

          <Link
            href="/spaces"
            onClick={(e) => gate('/spaces', e)}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground capitalize transition-colors hover:bg-primary/90 lg:mt-36"
          >
            Try {sel.key}
          </Link>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted lg:aspect-auto">
          <Image
            key={sel.key}
            src={sel.image}
            alt={`${sel.key} style preview`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
