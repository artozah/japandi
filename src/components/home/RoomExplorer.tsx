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

const ROOMS: { name: string; icon: LucideIcon; image: string }[] = [
  { name: 'Living Room', icon: Home, image: '/rooms/living-room.webp' },
  { name: 'Bedroom', icon: Bed, image: '/rooms/bedroom.webp' },
  { name: 'Kitchen', icon: ChefHat, image: '/rooms/kitchen.webp' },
  { name: 'Home Office', icon: Briefcase, image: '/rooms/home-office.webp' },
  { name: 'Bathroom', icon: Bath, image: '/rooms/bathroom.webp' },
  { name: 'Outdoor', icon: TreePine, image: '/rooms/outdoor.webp' },
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
        {ROOMS.map(({ name, icon: Icon, image }) => (
          <Link
            key={name}
            href="/spaces"
            onClick={(e) => gate('/spaces', e)}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent-warm/40"
          >
            <div className="aspect-[16/10] border-b border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
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
