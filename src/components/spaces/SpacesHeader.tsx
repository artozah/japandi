import { Download, Settings, Share2 } from 'lucide-react';
import Image from 'next/image';

export function SpacesHeader() {
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
