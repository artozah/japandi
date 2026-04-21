'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { Section, SectionHeader } from '@/components/home/Section';

const FAQS = [
  {
    q: 'Will the redesign look like my actual room?',
    a: 'Yes. Our model preserves your room’s architecture — walls, windows, doors, ceiling height — and restyles only the furnishings, textiles, and finishes. The geometry stays true.',
  },
  {
    q: 'Can I buy the furniture shown in the renders?',
    a: 'Every render includes a shoppable list of the closest real-world pieces we could match, sourced from CB2, West Elm, Muji, IKEA, Article, and 40+ other retailers.',
  },
  {
    q: 'How many tokens does one room use?',
    a: 'One token = one render. A typical room project uses 4–8 tokens as you explore styles and iterate. Standard ($19) gives you 100 tokens monthly — enough for ~15 rooms.',
  },
  {
    q: 'What photo quality do I need?',
    a: 'A clear phone photo in daylight is plenty. Aim for wide-angle framing that shows walls and floor; avoid heavy HDR or night shots. We auto-correct exposure.',
  },
  {
    q: 'Do you train on my uploads?',
    a: 'No. Your photos are used only to generate your renders and are deleted from our servers after 30 days. You can delete them sooner from your dashboard.',
  },
  {
    q: 'Can I cancel a subscription?',
    a: 'Cancel anytime, no questions. Unused tokens remain valid until the end of the billing period. Refunds are available within 14 days if you’ve used fewer than 10 tokens.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section width="max-w-3xl">
      <SectionHeader
        eyebrow="Questions"
        title="Everything you’re probably wondering."
      />

      <div className="mt-12 border-t border-border">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          const panelId = `faq-panel-${i}`;
          const buttonId = `faq-button-${i}`;
          return (
            <div key={i} className="border-b border-border">
              <button
                type="button"
                id={buttonId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="text-base font-medium tracking-tight text-foreground">
                  {f.q}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border ${
                    isOpen ? 'text-accent-warm' : 'text-muted-foreground'
                  }`}
                >
                  {isOpen ? (
                    <Minus className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="max-w-[44rem] pb-7 pr-14 text-sm leading-relaxed text-muted-foreground"
                >
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between gap-6 rounded-xl border border-border bg-card p-6">
        <div>
          <p className="text-sm font-medium text-foreground">
            Still have questions?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            We reply within 24 hours on weekdays.
          </p>
        </div>
        <Link
          href="#"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Contact support
        </Link>
      </div>
    </Section>
  );
}
