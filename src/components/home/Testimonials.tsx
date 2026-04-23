import { Star } from 'lucide-react';
import { Section } from '@/components/home/Section';

const TESTIMONIALS = [
  {
    name: 'Mari K.',
    role: 'Renter · Portland',
    quote:
      'I cycled through eight styles in one evening and finally knew what I actually wanted. Bought three pieces the next day.',
  },
  {
    name: 'Daniel R.',
    role: 'Homeowner · Berlin',
    quote:
      'My wife and I had been debating the living room for months. We picked a direction in twenty minutes.',
  },
  {
    name: 'Priya S.',
    role: 'Realtor · Austin',
    quote:
      'I stage listings virtually now. Saves me $2k per unit and buyers love seeing the potential.',
  },
  {
    name: 'Joon H.',
    role: 'Designer · Seoul',
    quote:
      'I use it as a mood-board generator for clients. It’s become part of my intake process.',
  },
];

const PRESS = [
  'Dwell',
  'Apartment Therapy',
  'Domino',
  'Architectural Digest',
  'Wallpaper*',
];

export function Testimonials() {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-warm">
            Loved by 10,000+
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            Homeowners, renters,
            <br />
            designers, realtors.
          </h2>
        </div>
        <dl className="flex gap-8 font-mono text-xs text-muted-foreground">
          <div>
            <dd className="font-sans text-2xl font-bold text-foreground">
              4.9
            </dd>
            <dt>avg. rating</dt>
          </div>
          <div>
            <dd className="font-sans text-2xl font-bold text-foreground">
              142k
            </dd>
            <dt>renders</dt>
          </div>
          <div>
            <dd className="font-sans text-2xl font-bold text-foreground">
              36
            </dd>
            <dt>styles</dt>
          </div>
        </dl>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-xl border border-border bg-card p-7"
          >
            <div className="flex gap-0.5 text-accent-warm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-current"
                  strokeWidth={0}
                />
              ))}
            </div>
            <blockquote className="mt-4 text-base leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-accent-warm">
                {t.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {t.role}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-8 border-y border-border py-6">
        {PRESS.map((p) => (
          <span
            key={p}
            className="text-base font-semibold tracking-tight text-muted-foreground/60"
          >
            {p}
          </span>
        ))}
      </div>
    </Section>
  );
}
