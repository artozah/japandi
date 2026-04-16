'use client';

import { accordionData, navItems } from '@/data/spaces';
import { cn } from '@/lib/utils';
import type { AccordionEntry, NavId } from '@/types/spaces';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

function ImageGrid({ items }: { items: AccordionEntry[] }) {
  return (
    <div className="grid gap-1.5 pt-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 1024px) 80px, 120px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 text-center to-transparent p-1.5">
            <span className="text-sm font-medium leading-none text-white">
              {item.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  items?: AccordionEntry[];
  badges?: string[];
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({
  title,
  items,
  badges,
  isOpen,
  onToggle,
}: AccordionItemProps) {
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
        className="flex w-full items-center justify-between py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
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
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="cursor-pointer rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <ImageGrid items={items ?? []} />
          )}
        </div>
      )}
    </div>
  );
}

interface LeftMenuProps {
  activeNav: NavId;
  onNavChange: (id: NavId) => void;
}

function AccordionPanel({ activeNav }: { activeNav: NavId }) {
  const groups = accordionData[activeNav] ?? [];
  const activeItem = navItems.find((n) => n.id === activeNav);
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    groups[0]?.title ?? null,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {activeItem?.label}
      </h3>
      <p className="mb-2 shrink-0 text-xs text-muted-foreground">
        {activeItem?.description}
      </p>
      {groups.map((group) => (
        <AccordionItem
          key={group.title}
          title={group.title}
          items={group.items}
          badges={group.badges}
          isOpen={openAccordion === group.title}
          onToggle={() =>
            setOpenAccordion((prev) =>
              prev === group.title ? null : group.title,
            )
          }
        />
      ))}
    </div>
  );
}

export function LeftMenu({ activeNav, onNavChange }: LeftMenuProps) {
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
              onClick={() => onNavChange(item.id)}
              className={cn(
                'flex w-10 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Accordion panel — key resets state when nav changes */}
      <AccordionPanel key={activeNav} activeNav={activeNav} />
    </aside>
  );
}
