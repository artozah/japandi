import { Upload, Sparkles, Download, type LucideIcon } from 'lucide-react';
import { Section, SectionHeader } from '@/components/home/Section';

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: string;
};

const STEPS: Step[] = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Space',
    description:
      'Take a photo of any room and upload it to our platform. We support all common image formats.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI Transforms It',
    description:
      'Our AI analyses your space and generates stunning redesigns in seconds, preserving your room’s architecture.',
    meta: '~8 seconds per render',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download & Share',
    description:
      'Save your favourite designs, compare variations, and share them with friends or your designer.',
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        eyebrow="Process"
        title="How It Works"
        subtitle="Three simple steps to your dream interior."
      />

      <ol className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          aria-hidden
          className="absolute inset-x-0 top-[3.75rem] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
        />

        {STEPS.map(({ number, icon: Icon, title, description, meta }, i) => {
          const isFeatured = i === 1;
          return (
            <li
              key={number}
              className={`relative rounded-xl border p-8 ${
                isFeatured
                  ? 'border-accent-warm/40 bg-card shadow-[0_0_0_1px_rgba(201,168,118,0.08)_inset]'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`font-mono text-xs font-medium tracking-wider ${
                    isFeatured ? 'text-accent-warm' : 'text-muted-foreground'
                  }`}
                >
                  {number}
                </span>
                {meta && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-accent-warm" />
                    {meta}
                  </span>
                )}
              </div>

              <div
                className={`mt-5 flex h-11 w-11 items-center justify-center rounded-lg border ${
                  isFeatured
                    ? 'border-accent-warm/30 bg-accent-warm/10 text-accent-warm'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
