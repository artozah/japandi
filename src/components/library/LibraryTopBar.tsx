'use client';

import { ArrowLeft, Coins } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LibraryTopBarProps {
  tokens: number | null;
}

export function LibraryTopBar({ tokens }: LibraryTopBarProps) {
  return (
    <header className="flex h-10 w-full shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Envisio home"
        >
          <Image
            src="/logo_icon.svg"
            alt="Envisio"
            width={22}
            height={22}
            className="rounded-[4px]"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Envisio
          </span>
        </Link>
        <Link
          href="/spaces"
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Spaces
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
          aria-label={`${tokens ?? '...'} tokens — get more`}
          title="Get more tokens"
        >
          <Coins className="h-3 w-3" />
          <span className="tabular-nums">
            {tokens === null ? '—' : tokens}
          </span>
        </Link>
      </div>
    </header>
  );
}
