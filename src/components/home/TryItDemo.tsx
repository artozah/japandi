import Link from 'next/link';
import { Upload, Download, Share2, RefreshCw } from 'lucide-react';
import { Section, SectionHeader } from '@/components/home/Section';

const SAMPLES = ['living', 'bedroom', 'kitchen', 'office'];
const STYLES = [
  'japandi',
  'scandi',
  'minimal',
  'midcentury',
  'boho',
  'industrial',
];

export function TryItDemo() {
  return (
    <Section muted width="max-w-7xl">
      <SectionHeader
        eyebrow="Try before you buy"
        title="See your space transformed in 8 seconds."
        subtitle="Pick a sample room or upload your own. No sign-up required for the first preview."
        width="max-w-2xl"
      />

      <div className="mt-12 grid gap-8 rounded-xl border border-border bg-card p-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Step 01 · Your room
          </p>
          <div className="mt-3 rounded-lg border-2 border-dashed border-border bg-background p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-accent-warm">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              Drop a photo or click to upload
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, HEIC · up to 20MB
            </p>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Or try a sample
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {SAMPLES.map((s) => (
              <div
                key={s}
                className="aspect-square rounded-md border border-border bg-muted"
              />
            ))}
          </div>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Step 02 · Style
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLES.map((s, i) => (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${
                  i === 0
                    ? 'border-accent-warm text-accent-warm'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {i === 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-warm" />
                )}
                {s}
              </span>
            ))}
          </div>

          <Link
            href="/spaces"
            className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-md bg-accent-warm px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Generate preview →
          </Link>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Preview · japandi
          </p>
          <div className="mt-3 aspect-[4/3] rounded-lg border border-border bg-muted" />

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-render
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Shop the look
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {['oak chair', 'linen sofa', 'paper lamp', 'wool rug'].map(
                (p) => (
                  <div
                    key={p}
                    className="aspect-square rounded-md border border-border bg-muted"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
