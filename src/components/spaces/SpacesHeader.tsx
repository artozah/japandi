import { Coins, Download, Settings, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SpacesHeaderProps {
  tokens: number | null;
}

export function SpacesHeader({ tokens }: SpacesHeaderProps) {
  return (
    <header className="flex h-[30px] w-full shrink-0 items-center justify-between border-b border-border bg-background px-3">
      <div className="flex items-center gap-1.5">
        <Image
          src="/logo_icon.svg"
          alt="Japandi"
          width={20}
          height={20}
          className="rounded-[4px]"
        />
        <span className="text-xs font-medium text-foreground">
          Japandi — AI Interior Design
        </span>
      </div>
      <div className="flex items-center gap-2">
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
        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Share"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Export"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
