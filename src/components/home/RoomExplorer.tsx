'use client';

import {
  Home,
  Bed,
  ChefHat,
  Briefcase,
  Bath,
  TreePine,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Section, SectionHeader } from '@/components/home/Section';
import { useSignInGate } from '@/hooks/useSignInGate';

const ROOMS: { name: string; icon: LucideIcon }[] = [
  { name: 'Living Room', icon: Home },
  { name: 'Bedroom', icon: Bed },
  { name: 'Kitchen', icon: ChefHat },
  { name: 'Home Office', icon: Briefcase },
  { name: 'Bathroom', icon: Bath },
  { name: 'Outdoor', icon: TreePine },
];

export function RoomExplorer() {
  const gate = useSignInGate();

  return (
    <Section muted>
      <SectionHeader
        eyebrow="Works in every room"
        title="From living room to laundry."
        subtitle="Our model handles every room type and condition — upload yours to see."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map(({ name, icon: Icon }) => (
          <Link
            key={name}
            href="/spaces"
            onClick={(e) => gate('/spaces', e)}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent-warm/40"
          >
            <div className="aspect-[16/10] border-b border-border bg-muted" />
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-accent-warm">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">{name}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
