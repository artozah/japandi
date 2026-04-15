import { Settings, Share2, Download } from "lucide-react";

export function SpacesHeader() {
  return (
    <header className="flex h-[30px] w-full shrink-0 items-center justify-between border-b border-border bg-background px-3">
      <span className="text-xs font-medium text-foreground">
        Untitled Project
      </span>
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
