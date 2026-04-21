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
import { Section, SectionHeader } from '@/components/home/Section';

const ROOMS: { name: string; icon: LucideIcon; count: number }[] = [
  { name: 'Living Room', icon: Home, count: 48 },
  { name: 'Bedroom', icon: Bed, count: 36 },
  { name: 'Kitchen', icon: ChefHat, count: 28 },
  { name: 'Home Office', icon: Briefcase, count: 24 },
  { name: 'Bathroom', icon: Bath, count: 22 },
  { name: 'Outdoor', icon: TreePine, count: 18 },
];

export function RoomExplorer() {
  return (
    <Section muted>
      <SectionHeader
        eyebrow="Works in every room"
        title="From living room to laundry."
        subtitle="Trained on 50,000+ interior photographs across every room type and condition."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map(({ name, icon: Icon, count }) => (
          <div
            key={name}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent-warm/40"
          >
            <div className="aspect-[16/10] border-b border-border bg-muted" />
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-accent-warm">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {count} example renders
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
