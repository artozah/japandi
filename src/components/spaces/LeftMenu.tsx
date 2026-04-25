'use client';

import { GenerationOverlay } from '@/components/spaces/GenerationOverlay';
import { UserAccountWidget } from '@/components/spaces/UserAccountWidget';
import { accordionData, navItems } from '@/data/spaces';
import { cn } from '@/lib/utils';
import type {
  AccordionEntry,
  InFlightMap,
  NavId,
  StyleSelection,
} from '@/types/spaces';
import { ChevronDown, Images, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export type { StyleSelection } from '@/types/spaces';

interface ImageGridProps {
  items: readonly AccordionEntry[];
  navId: NavId;
  groupTitle: string;
  inFlight: InFlightMap;
  onSelect: (selection: StyleSelection) => void;
}

function ImageGrid({ items, navId, groupTitle, inFlight, onSelect }: ImageGridProps) {
  return (
    <div className="grid gap-1.5 pt-2">
      {items.map((item) => {
        const styleKey = `${navId}:${item.title}`;
        const flight = inFlight[styleKey];
        const isLoading = Boolean(flight);
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
                promptSpec: {
                  category: navId,
                  groupTitle,
                  itemTitle: item.title,
                },
              })
            }
            className={cn(
              'group relative min-w-0 aspect-square overflow-hidden rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
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
              sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 120px"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 text-center to-transparent p-1.5">
              <span className="text-sm font-medium leading-none text-white">
                {item.title}
              </span>
            </div>
            {flight && (
              <GenerationOverlay
                percentage={flight.percentage}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface BadgeListProps {
  badges: readonly string[];
  navId: NavId;
  groupTitle: string;
  inFlight: InFlightMap;
  onSelect: (selection: StyleSelection) => void;
}

function BadgeList({ badges, navId, groupTitle, inFlight, onSelect }: BadgeListProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {badges.map((badge) => {
        const styleKey = `${navId}:${badge}`;
        const flight = inFlight[styleKey];
        const isLoading = Boolean(flight);
        return (
          <button
            key={badge}
            type="button"
            disabled={isLoading}
            onClick={() =>
              onSelect({
                styleKey,
                styleLabel: badge,
                promptSpec: {
                  category: navId,
                  groupTitle,
                  itemTitle: badge,
                },
              })
            }
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
  items?: readonly AccordionEntry[];
  badges?: readonly string[];
  navId: NavId;
  inFlight: InFlightMap;
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
    <div className="flex flex-col border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full shrink-0 items-center justify-between py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
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
        <div className="pb-3">
          {badges && badges.length > 0 ? (
            <BadgeList
              badges={badges}
              navId={navId}
              groupTitle={title}
              inFlight={inFlight}
              onSelect={onSelect}
            />
          ) : (
            <ImageGrid
              items={items ?? []}
              navId={navId}
              groupTitle={title}
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
  inFlightByStyleKey: InFlightMap;
  onSelectStyle: (selection: StyleSelection) => void;
}

export interface AccordionPanelProps {
  activeNav: NavId;
  inFlightByStyleKey: InFlightMap;
  onSelectStyle: (selection: StyleSelection) => void;
}

export function AccordionPanel({
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {activeItem?.label}
      </h3>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {groups.map((group) => (
          <AccordionItem
            key={group.title}
            title={group.title}
            items={'items' in group ? group.items : undefined}
            badges={'badges' in group ? group.badges : undefined}
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
    <aside className="flex h-full w-[20%] shrink-0 overflow-hidden flex-row border-r border-border bg-background">
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
        <div className="mt-auto flex flex-col items-center gap-2">
          <Link
            href="/library"
            aria-label="View all generated"
            title="View all generated"
            className="flex w-10 flex-col items-center gap-1 rounded-lg px-1 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Images className="h-4 w-4" />
            <span className="text-[10px] font-medium leading-none">Library</span>
          </Link>
          <UserAccountWidget />
        </div>
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
