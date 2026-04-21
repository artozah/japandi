import Link from 'next/link';
import { Star } from 'lucide-react';
import { Section } from '@/components/home/Section';

const TILES = [
  { handle: '@ella.r', h: 280, hearts: 284 },
  { handle: '@kenji.h', h: 240, hearts: 412 },
  { handle: '@marta.c', h: 320, hearts: 189 },
  { handle: '@devon.l', h: 260, hearts: 367 },
  { handle: '@amir.p', h: 300, hearts: 521 },
  { handle: '@noa.t', h: 220, hearts: 142 },
  { handle: '@felix.w', h: 280, hearts: 298 },
  { handle: '@sage.k', h: 260, hearts: 231 },
];

export function CommunityGallery() {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-warm">
            Community · #madewithjapandi
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            Real rooms. Real people.
            <br />
            Real transformations.
          </h2>
        </div>
        <Link
          href="#"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Submit yours →
        </Link>
      </div>

      <div className="mt-12 columns-2 gap-4 md:columns-3 lg:columns-4">
        {TILES.map((t, i) => (
          <div key={i} className="mb-4 break-inside-avoid">
            <div
              className="rounded-lg border border-border bg-muted"
              style={{ height: t.h }}
            />
            <div className="mt-2.5 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {t.handle}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star
                  className="h-3 w-3 fill-current text-accent-warm"
                  strokeWidth={0}
                />
                {t.hearts}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
