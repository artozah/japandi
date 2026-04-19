'use client';

import { ViewPlansModal } from '@/components/spaces/ViewPlansModal';
import { Coins } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface SpacesHeaderProps {
  tokens: number | null;
}

export function SpacesHeader({ tokens }: SpacesHeaderProps) {
  const [plansOpen, setPlansOpen] = useState(false);

  return (
    <header className="flex h-10 w-full shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-1.5">
        <Image
          src="/logo_icon.svg"
          alt="Japandi"
          width={22}
          height={22}
          className="rounded-[4px]"
        />
        <span className="text-xs font-medium text-foreground">
          Japandi — AI Interior Design
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPlansOpen(true)}
          className="inline-flex items-center gap-1 cursor-pointer rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
          aria-label={`${tokens ?? '...'} tokens — get more`}
          title="Get more tokens"
        >
          <Coins className="h-3 w-3" />
          <span className="tabular-nums">
            {tokens === null ? '—' : tokens}
          </span>
        </button>
      </div>

      <ViewPlansModal open={plansOpen} onClose={() => setPlansOpen(false)} />
    </header>
  );
}
