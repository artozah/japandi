'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import {
  useTheme,
  type ChatFontSize,
  type Theme,
} from '@/components/ThemeProvider';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { useAutoResetState } from '@/hooks/useAutoResetState';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/db/schema';
import { getPlan } from '@/lib/paddle';
import { Check, Monitor, Moon, Sun, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onOpenViewPlans: () => void;
}

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> =
  [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

const CHAT_FONT_OPTIONS: Array<{ value: ChatFontSize; label: string }> = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export function SettingsModal({
  open,
  onClose,
  subscription,
  onOpenViewPlans,
}: SettingsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Settings" maxWidth="max-w-xl">
      <Tabs
        tabs={[
          {
            id: 'general',
            label: 'General',
            content: <GeneralTab />,
          },
          {
            id: 'account',
            label: 'Account',
            content: (
              <AccountTab
                subscription={subscription}
                onOpenViewPlans={onOpenViewPlans}
                onAfterDelete={onClose}
              />
            ),
          },
          {
            id: 'usage',
            label: 'Usage',
            content: <UsageTab open={open} />,
          },
        ]}
      />
    </Modal>
  );
}

function SegmentGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; icon?: typeof Sun }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex overflow-hidden rounded-md border border-border"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'bg-card text-foreground hover:bg-muted',
              'border-r border-border last:border-r-0',
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="text-sm text-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function GeneralTab() {
  const { theme, setTheme, chatFontSize, setChatFontSize } = useTheme();
  return (
    <div className="divide-y divide-border">
      <Row label="Appearance">
        <SegmentGroup
          options={THEME_OPTIONS}
          value={theme}
          onChange={setTheme}
        />
      </Row>
      <Row label="Chat font size">
        <SegmentGroup
          options={CHAT_FONT_OPTIONS}
          value={chatFontSize}
          onChange={setChatFontSize}
        />
      </Row>
    </div>
  );
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function AccountTab({
  subscription,
  onOpenViewPlans,
  onAfterDelete,
}: {
  subscription: Subscription | null;
  onOpenViewPlans: () => void;
  onAfterDelete: () => void;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const {
    value: confirming,
    setWithTimeout: startConfirm,
    reset: cancelConfirm,
  } = useAutoResetState(false, 4000);
  const [deleting, setDeleting] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const fullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    '—';
  const memberSince = formatDate(user?.createdAt ?? null);

  const plan = subscription ? getPlan(subscription.planKey) : undefined;
  const isSubscriptionActive =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  const handleDelete = useCallback(async () => {
    cancelConfirm();
    setDeleting(true);
    try {
      const res = await fetch('/api/me', { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Could not delete your account.');
        return;
      }
      toast.success('Account deleted.');
      await signOut({ redirectUrl: '/' });
      onAfterDelete();
    } catch {
      toast.error('Could not delete your account.');
    } finally {
      setDeleting(false);
    }
  }, [cancelConfirm, onAfterDelete, signOut]);

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="rounded-lg border border-border p-4">
        <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-foreground">
          <span className="text-muted-foreground">Name</span>
          <span>{fullName}</span>
          <span className="text-muted-foreground">Email</span>
          <span>{email}</span>
          <span className="text-muted-foreground">Member since</span>
          <span>{memberSince}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-foreground">
              {plan
                ? `${plan.name} (${isSubscriptionActive ? subscription?.status : 'inactive'})`
                : 'No active subscription'}
            </div>
            {subscription?.renewsAt && (
              <div className="mt-1 text-xs text-muted-foreground">
                Renews {formatDate(subscription.renewsAt)}
              </div>
            )}
            {subscription?.endsAt && !subscription.renewsAt && (
              <div className="mt-1 text-xs text-muted-foreground">
                Active until {formatDate(subscription.endsAt)}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenViewPlans}
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs font-medium text-foreground hover:bg-muted"
          >
            {plan ? 'Manage subscription' : 'View plans'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-foreground">
              Delete account
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently removes your uploads, generations, and subscription
              record. This can&rsquo;t be undone.
            </p>
          </div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex h-9 items-center gap-1 rounded-md bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                {deleting ? 'Deleting…' : 'Confirm'}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={cancelConfirm}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium text-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startConfirm(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-red-500/60 px-3 text-xs font-medium text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface UsageData {
  generations: number;
  refunded: number;
  pending: number;
  monthStart: string;
}

function UsageTab({ open }: { open: boolean }) {
  const [tokens, setTokens] = useState<number | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    Promise.all([
      fetch('/api/me/tokens', { signal: controller.signal }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/me/usage', { signal: controller.signal }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([balance, summary]) => {
        if (balance && typeof balance.tokens === 'number')
          setTokens(balance.tokens);
        if (summary) setUsage(summary as UsageData);
      })
      .catch(() => {
        /* silent */
      });
    return () => controller.abort();
  }, [open]);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="Tokens left"
        value={tokens === null ? '…' : String(tokens)}
      />
      <StatCard
        label="Generations this month"
        value={usage ? String(usage.generations) : '…'}
      />
      <StatCard
        label="Refunded this month"
        value={usage ? String(usage.refunded) : '…'}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}
