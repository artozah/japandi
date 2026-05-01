'use client';

import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import { useSignInGate } from '@/hooks/useSignInGate';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Spaces', href: '/spaces', gated: true },
  { label: 'Pricing', href: '/#pricing' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const gate = useSignInGate();
  const gateSpaces = (e: MouseEvent) => gate('/spaces', e);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"
        >
          <Image
            src="/logo_dark.svg"
            alt="Envisio"
            width={180}
            height={52}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.gated ? (e) => gate(link.href, e) : undefined}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/spaces"
            onClick={gateSpaces}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-border transition-all duration-200 md:hidden',
          mobileOpen ? 'max-h-64' : 'max-h-0 border-t-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={(e) => {
                if (link.gated) gate(link.href, e);
                setMobileOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/spaces"
            className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={(e) => {
              gateSpaces(e);
              setMobileOpen(false);
            }}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
