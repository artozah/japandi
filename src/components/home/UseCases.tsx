import {
  Home,
  Key,
  Camera,
  Brush,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Section, SectionHeader } from '@/components/home/Section';

const USECASES: {
  icon: LucideIcon;
  who: string;
  desc: string;
  href: string;
}[] = [
  {
    icon: Home,
    who: 'Homeowners',
    desc: 'Visualise a renovation before you commit a dollar. Try six styles, pick one, hire with confidence.',
    href: '#how-it-works',
  },
  {
    icon: Key,
    who: 'Renters',
    desc: 'Reimagine your space without touching the walls. Find pieces that work with what you already own.',
    href: '#styles',
  },
  {
    icon: Camera,
    who: 'Realtors',
    desc: 'Virtually stage every listing for a tenth of the cost. Sell the possibility, not the empty room.',
    href: '#pricing',
  },
  {
    icon: Brush,
    who: 'Designers',
    desc: 'Generate mood-boards in minutes, not afternoons. A new tool in your intake and pitch process.',
    href: '#comparison',
  },
];

export function UseCases() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Who it’s for"
        title="Built for the way you actually decide."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USECASES.map(({ icon: Icon, who, desc, href }) => (
          <div
            key={who}
            className="flex flex-col rounded-xl border border-border bg-card p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-accent-warm">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {who}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
            <Link
              href={href}
              className="group/link mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-warm hover:text-accent-warm/80"
            >
              Learn more
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
