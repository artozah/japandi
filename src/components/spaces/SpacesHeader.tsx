'use client';

import { UserAccountWidget } from '@/components/spaces/UserAccountWidget';
import { ViewPlansModal } from '@/components/spaces/ViewPlansModal';
import { Coins, Images } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface SpacesHeaderProps {
  tokens: number | null;
  showAccountWidget?: boolean;
  subtitle?: string;
}

export function SpacesHeader({
  tokens,
  showAccountWidget,
  subtitle,
}: SpacesHeaderProps) {
  const [plansOpen, setPlansOpen] = useState(false);

  return (
    <header className="flex h-10 w-full shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-1.5">
        <Image
          src="/logo_icon.svg"
          alt="Envisio"
          width={22}
          height={22}
          className="rounded-[4px]"
        />
        <span className="text-xs font-medium text-foreground">
          Envisio — {subtitle ?? 'AI Interior Design'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {showAccountWidget && (
          <Link
            href="/library"
            aria-label="Library"
            title="Library"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Images className="h-4 w-4" />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setPlansOpen(true)}
          className="inline-flex items-center gap-1 cursor-pointer rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
          aria-label={`${tokens ?? '...'} tokens — get more`}
          title="Get more tokens"
        >
          <Coins className="h-3 w-3" />
          <span className="tabular-nums">{tokens === null ? '—' : tokens}</span>
        </button>
        {showAccountWidget && <UserAccountWidget menuPlacement="below" />}
      </div>

      <ViewPlansModal open={plansOpen} onClose={() => setPlansOpen(false)} />
    </header>
  );
}
