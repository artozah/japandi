'use client';

import { GenerationOverlay } from '@/components/spaces/GenerationOverlay';
import { accordionData, navItems } from '@/data/spaces';
import { cn } from '@/lib/utils';
import type { AccordionEntry, NavId } from '@/types/spaces';
import { ChevronDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface StyleSelection {
  styleKey: string;
  styleLabel: string;
  styleImage?: string;
}

interface ImageGridProps {
  items: AccordionEntry[];
  navId: NavId;
  inFlight: Record<string, number>;
  onSelect: (selection: StyleSelection) => void;
}

function ImageGrid({ items, navId, inFlight, onSelect }: ImageGridProps) {
  return (
    <div className="grid gap-1.5 pt-2">
      {items.map((item) => {
        const styleKey = `${navId}:${item.title}`;
        const pct = inFlight[styleKey];
        const isLoading = typeof pct === 'number';
        return (
          <button
            key={item.title}
            type="button"
            disabled={isLoading}
            aria-label={`Apply ${item.title} style`}
            onClick={() =>
              onSelect({
                styleKey,
                styleLabel: item.title,
                styleImage: item.image,
              })
            }
            className={cn(
              'group relative aspect-square overflow-hidden rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
              isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className={cn(
                'object-cover transition-transform',
                !isLoading && 'group-hover:scale-105',
              )}
              sizes="(max-width: 1024px) 80px, 120px"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 text-center to-transparent p-1.5">
              <span className="text-sm font-medium leading-none text-white">
                {item.title}
              </span>
            </div>
            {isLoading && <GenerationOverlay percentage={pct} />}
          </button>
        );
      })}
    </div>
  );
}

interface BadgeListProps {
  badges: string[];
  navId: NavId;
  inFlight: Record<string, number>;
  onSelect: (selection: StyleSelection) => void;
}

function BadgeList({ badges, navId, inFlight, onSelect }: BadgeListProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {badges.map((badge) => {
        const styleKey = `${navId}:${badge}`;
        const isLoading = typeof inFlight[styleKey] === 'number';
        return (
          <button
            key={badge}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect({ styleKey, styleLabel: badge })}
            className={cn(
              'flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
              isLoading
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:bg-foreground hover:text-background',
            )}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            {badge}
          </button>
        );
      })}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  items?: AccordionEntry[];
  badges?: string[];
  navId: NavId;
  inFlight: Record<string, number>;
  onSelect: (selection: StyleSelection) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({
  title,
  items,
  badges,
  navId,
  inFlight,
  onSelect,
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
            <BadgeList
              badges={badges}
              navId={navId}
              inFlight={inFlight}
              onSelect={onSelect}
            />
          ) : (
            <ImageGrid
              items={items ?? []}
              navId={navId}
              inFlight={inFlight}
              onSelect={onSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface LeftMenuProps {
  activeNav: NavId;
  onNavChange: (id: NavId) => void;
  inFlightByStyleKey: Record<string, number>;
  onSelectStyle: (selection: StyleSelection) => void;
}

interface AccordionPanelProps {
  activeNav: NavId;
  inFlightByStyleKey: Record<string, number>;
  onSelectStyle: (selection: StyleSelection) => void;
}

function AccordionPanel({
  activeNav,
  inFlightByStyleKey,
  onSelectStyle,
}: AccordionPanelProps) {
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
          navId={activeNav}
          inFlight={inFlightByStyleKey}
          onSelect={onSelectStyle}
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

export function LeftMenu({
  activeNav,
  onNavChange,
  inFlightByStyleKey,
  onSelectStyle,
}: LeftMenuProps) {
  return (
    <aside className="flex h-full w-[20%] shrink-0 flex-row border-r border-border bg-background">
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
      <AccordionPanel
        key={activeNav}
        activeNav={activeNav}
        inFlightByStyleKey={inFlightByStyleKey}
        onSelectStyle={onSelectStyle}
      />
    </aside>
  );
}
