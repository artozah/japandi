'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { HelpModal } from '@/components/spaces/HelpModal';
import { SettingsModal } from '@/components/spaces/SettingsModal';
import { ViewPlansModal } from '@/components/spaces/ViewPlansModal';
import type { Subscription } from '@/db/schema';
import { getPlan } from '@/lib/paddle';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type ModalKey = 'settings' | 'help' | 'plans' | null;

function initialsFrom(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  const fi = firstName?.trim()[0];
  const li = lastName?.trim()[0];
  if (fi && li) return (fi + li).toUpperCase();
  if (fi) return fi.toUpperCase();
  if (email) return email.trim()[0]?.toUpperCase() ?? '?';
  return '?';
}

export function UserAccountWidget({
  menuPlacement = 'above',
}: {
  menuPlacement?: 'above' | 'below';
} = {}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const loadSubscription = useCallback(async (signal?: AbortSignal) => {
    try {
      const r = await fetch('/api/me/subscription', { signal });
      if (!r.ok) return;
      const data = (await r.json()) as { subscription?: Subscription | null };
      if ('subscription' in data) {
        setSubscription(data.subscription ?? null);
      }
      setSubscriptionLoaded(true);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!open || subscriptionLoaded) return;
    const controller = new AbortController();
    loadSubscription(controller.signal);
    return () => controller.abort();
  }, [open, subscriptionLoaded, loadSubscription]);

  if (!isLoaded || !isSignedIn || !user) return null;

  const email = user.primaryEmailAddress?.emailAddress ?? '';
  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    email;
  const initials = initialsFrom(user.firstName, user.lastName, email);
  const imageUrl = user.imageUrl;
  const plan = subscription ? getPlan(subscription.planKey) : undefined;
  const planLabel = plan?.name ?? 'Free';

  const openModal = (key: ModalKey) => {
    setModal(key);
    setOpen(false);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ redirectUrl: '/' });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex h-9 w-9 items-center justify-center overflow-hidden cursor-pointer rounded-full border border-border bg-muted text-xs font-semibold text-foreground transition-colors',
          open ? 'ring-2 ring-foreground' : 'hover:bg-muted/70',
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={fullName}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-xl',
            menuPlacement === 'above'
              ? 'bottom-full left-0 mb-2'
              : 'top-full right-0 mt-2',
          )}
        >
          <div className="flex items-start gap-3 border-b border-border p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={fullName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {fullName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {email}
              </div>
              <div className="inline-flex items-center text-xs font-medium text-foreground">
                {planLabel} plan
              </div>
            </div>
          </div>

          <div className="flex flex-col py-1">
            <MenuItem
              icon={Settings}
              label="Settings"
              onClick={() => openModal('settings')}
            />
            <MenuItem
              icon={HelpCircle}
              label="Get help"
              onClick={() => openModal('help')}
            />
            <MenuItem
              icon={CreditCard}
              label="View all plans"
              onClick={() => openModal('plans')}
            />
          </div>

          <div className="border-t border-border py-1">
            <MenuItem icon={LogOut} label="Log out" onClick={handleSignOut} />
          </div>
        </div>
      )}

      <SettingsModal
        open={modal === 'settings'}
        onClose={() => setModal(null)}
        subscription={subscription}
        onOpenViewPlans={() => setModal('plans')}
        onSubscriptionChanged={() => loadSubscription()}
      />
      <HelpModal open={modal === 'help'} onClose={() => setModal(null)} />
      <ViewPlansModal
        open={modal === 'plans'}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </button>
  );
}
