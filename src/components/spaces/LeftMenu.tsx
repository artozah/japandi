'use client';

import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/spaces';
import {
  CalendarHeart,
  CheckCircle,
  ChevronDown,
  MapPin,
  Palette,
  Sparkles,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const navItems: NavItem[] = [
  { id: 'style', label: 'Style', icon: Sparkles },
  { id: 'occasions', label: 'Occasions', icon: CalendarHeart },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'themes', label: 'Themes', icon: Palette },
  { id: 'enhance', label: 'Enhance', icon: Wand2 },
  { id: 'finalize', label: 'Finalize', icon: CheckCircle },
];

const accordionData: Record<string, { title: string }[]> = {
  style: [
    { title: 'Minimalist' },
    { title: 'Wabi-Sabi' },
    { title: 'Scandinavian' },
    { title: 'Zen Modern' },
  ],
  occasions: [
    { title: 'Everyday Living' },
    { title: 'Guest Hosting' },
    { title: 'Holiday Season' },
    { title: 'Meditation Retreat' },
  ],
  locations: [
    { title: 'Living Room' },
    { title: 'Bedroom' },
    { title: 'Kitchen' },
    { title: 'Bathroom' },
  ],
  themes: [
    { title: 'Earth Tones' },
    { title: 'Neutral Palette' },
    { title: 'Warm Wood' },
    { title: 'Stone & Clay' },
  ],
  enhance: [{ title: 'Lighting' }, { title: 'Texture' }, { title: 'Greenery' }],
  finalize: [
    { title: 'High Resolution' },
    { title: 'Color Correction' },
    { title: 'Crop & Frame' },
  ],
};

function ImageGrid() {
  return (
    <div className="grid gap-1.5 pt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
        >
          <Image
            src="/images/japandi.webp"
            alt="Japandi inspiration"
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="80px"
          />
        </div>
      ))}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col border-b border-border last:border-b-0',
        isOpen && 'min-h-0 flex-1',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2.5 text-left text-xs font-medium text-foreground transition-colors hover:text-muted-foreground"
      >
        {title}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          <ImageGrid />
        </div>
      )}
    </div>
  );
}

interface LeftMenuProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

export function LeftMenu({ activeNav, onNavChange }: LeftMenuProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const items = accordionData[activeNav] ?? [];

  return (
    <aside className="flex h-full w-[20%] shrink-0 flex-row border-r border-border bg-background">
      {/* Icon strip */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavChange(item.id);
                setOpenAccordion(null);
              }}
              className={cn(
                'flex w-10 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Accordion panel */}
      <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
        <h3 className="mb-2 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {navItems.find((n) => n.id === activeNav)?.label}
        </h3>
        {items.map((item) => (
          <AccordionItem
            key={item.title}
            title={item.title}
            isOpen={openAccordion === item.title}
            onToggle={() =>
              setOpenAccordion((prev) =>
                prev === item.title ? null : item.title,
              )
            }
          />
        ))}
      </div>
    </aside>
  );
}
