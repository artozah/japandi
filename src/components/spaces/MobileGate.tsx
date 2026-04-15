"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

export function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Monitor className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Desktop Only
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The Spaces editor requires a screen width of at least 1024px. Please
          switch to a desktop browser for the full experience.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
