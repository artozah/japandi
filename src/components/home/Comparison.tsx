import { Check } from 'lucide-react';
import { Section, SectionHeader } from '@/components/home/Section';

const ROWS = [
  { label: 'Turnaround', ai: 'Under 10 seconds', designer: '2–6 weeks' },
  {
    label: 'Starting cost',
    ai: '$9 / 20 renders',
    designer: '$2,000–$8,000',
  },
  {
    label: 'Styles explored',
    ai: 'Unlimited',
    designer: '1–3 per revision',
  },
  {
    label: 'Iterations',
    ai: 'Free and instant',
    designer: 'Billed hourly',
  },
  {
    label: 'Expertise',
    ai: 'Good for exploration',
    designer: 'Tailored, constraints-aware',
  },
  {
    label: 'Best when',
    ai: 'Finding your direction',
    designer: 'Executing a committed vision',
  },
];

export function Comparison() {
  return (
    <Section id="comparison" muted width="max-w-5xl">
      <SectionHeader
        eyebrow="AI vs. Interior Designer"
        title={
          <>
            Not a replacement.
            <br />
            A starting point.
          </>
        }
        subtitle="Use Japandi to discover what you want. Bring a designer in for the execution — or don’t. Your call."
      />

      <div className="mt-12 overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1.5fr_1fr_1fr]">
          <div className="border-b border-border p-5" />
          <div className="border-b border-l border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-warm" />
              <span className="text-sm font-semibold text-foreground">
                Japandi AI
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-accent-warm">
              from $9
            </p>
          </div>
          <div className="border-b border-l border-border p-5">
            <p className="text-sm font-semibold text-muted-foreground">
              Traditional Designer
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              from $2,000
            </p>
          </div>

          {ROWS.map((r, i) => (
            <div key={r.label} className="contents">
              <div
                className={`p-5 text-sm text-muted-foreground ${i > 0 ? 'border-t border-border' : ''}`}
              >
                {r.label}
              </div>
              <div
                className={`flex items-center gap-2 border-l border-border bg-background p-5 text-sm text-foreground ${i > 0 ? 'border-t' : ''}`}
              >
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-accent-warm"
                  strokeWidth={2}
                />
                {r.ai}
              </div>
              <div
                className={`border-l border-border p-5 text-sm text-muted-foreground ${i > 0 ? 'border-t' : ''}`}
              >
                {r.designer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
