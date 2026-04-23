'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { Subscription } from '@/db/schema';
import {
  isActiveSubscriptionStatus,
  PLANS,
  type Plan,
  type PlanKey,
} from '@/lib/paddle';
import { Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useResolvedDarkMode } from '@/hooks/useResolvedDarkMode';

const PRICE_IDS: Record<PlanKey, string | undefined> = {
  custom: process.env.NEXT_PUBLIC_PADDLE_PRICE_CUSTOM,
  standard: process.env.NEXT_PUBLIC_PADDLE_PRICE_STANDARD,
  professional: process.env.NEXT_PUBLIC_PADDLE_PRICE_PROFESSIONAL,
};

const PENDING_BUY_KEY = 'pending-buy-plan';

export function PricingCards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const isDark = useResolvedDarkMode();
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;
  const [loadingKey, setLoadingKey] = useState<PlanKey | null>(null);
  const paddleRef = useRef<Paddle | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setSubscription(null);
      return;
    }
    const controller = new AbortController();
    fetch('/api/me/subscription', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && 'subscription' in data) {
          setSubscription((data.subscription as Subscription | null) ?? null);
        }
      })
      .catch(() => {
        /* silent */
      });
    return () => controller.abort();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;
    const environment =
      process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
        ? 'production'
        : 'sandbox';
    let cancelled = false;
    initializePaddle({ environment, token })
      .then((paddle) => {
        if (cancelled || !paddle) return;
        paddleRef.current = paddle;
        setPaddleReady(true);
      })
      .catch((err) => {
        console.error('[pricing] Paddle init failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBuy = useCallback(
    async (planKey: PlanKey) => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        sessionStorage.setItem(PENDING_BUY_KEY, planKey);
        openSignIn({ fallbackRedirectUrl: window.location.href });
        return;
      }

      const plan = PLANS.find((p) => p.key === planKey);
      const priceId = PRICE_IDS[planKey];
      if (!plan || !priceId) {
        toast.error('Pricing not configured yet.');
        return;
      }
      const paddle = paddleRef.current;
      if (!paddle) {
        toast.error('Checkout is still loading. Try again in a second.');
        return;
      }

      const email = user?.primaryEmailAddress?.emailAddress;
      const origin = window.location.origin;

      setLoadingKey(planKey);
      try {
        const tokenRes = await fetch('/api/billing/checkout-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planKey }),
        });
        if (!tokenRes.ok) {
          toast.error('Could not start checkout.');
          return;
        }
        const tokenData = (await tokenRes.json()) as { token?: string };
        if (!tokenData.token) {
          toast.error('Checkout token missing.');
          return;
        }

        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          ...(email ? { customer: { email } } : {}),
          customData: {
            token: tokenData.token,
            planKey,
          },
          settings: {
            successUrl: `${origin}/spaces?checkout=success`,
            theme: isDarkRef.current ? 'dark' : 'light',
          },
        });
      } catch (err) {
        console.error('[pricing] checkout open failed:', err);
        toast.error('Could not open checkout.');
      } finally {
        setLoadingKey(null);
      }
    },
    [isLoaded, isSignedIn, openSignIn, user],
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !paddleReady) return;
    const pending = sessionStorage.getItem(PENDING_BUY_KEY);
    if (!pending) return;
    sessionStorage.removeItem(PENDING_BUY_KEY);
    const plan = PLANS.find((p) => p.key === pending);
    if (!plan) return;
    handleBuy(plan.key);
  }, [isLoaded, isSignedIn, paddleReady, handleBuy]);

  return (
    <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
      {PLANS.map((plan) => {
        const isLoading = loadingKey === plan.key;
        const isCurrent =
          !!subscription &&
          subscription.planKey === plan.key &&
          isActiveSubscriptionStatus(subscription.status);
        return (
          <PricingCard
            key={plan.key}
            plan={plan}
            isLoading={isLoading}
            isCurrent={isCurrent}
            disabled={isCurrent || isLoading || !paddleReady}
            onBuy={() => handleBuy(plan.key)}
          />
        );
      })}
    </div>
  );
}

function PricingCard({
  plan,
  isLoading,
  isCurrent,
  disabled,
  onBuy,
}: {
  plan: Plan;
  isLoading: boolean;
  isCurrent: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const isHL = !!plan.highlight;
  const [amount, period] = plan.priceLabel.includes('/')
    ? plan.priceLabel.split('/')
    : [plan.priceLabel, null];
  const periodLabel = period ? `/${period}` : 'one-time';

  const features = [
    plan.kind === 'one_time'
      ? 'Pay once, use anytime'
      : 'Resets monthly, cancel anytime',
    'All 36 styles · HD downloads',
    'Commercial use included',
    'Refund on failed generations',
  ];

  const buttonLabel = isCurrent
    ? 'Current plan'
    : isLoading
      ? 'Opening…'
      : plan.kind === 'one_time'
        ? `Buy ${plan.name}`
        : `Subscribe to ${plan.name}`;

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-8 ${
        isHL ? 'border-accent-warm bg-card' : 'border-border bg-card'
      }`}
    >
      {isHL && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent-warm bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-warm">
          <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-accent-warm align-middle" />
          Most popular
        </span>
      )}

      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-foreground">
          {amount}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {periodLabel}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-accent-warm">
        {plan.tokens} tokens
      </p>

      <div className="my-6 h-px bg-border" />

      <ul className="flex flex-col gap-3">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-foreground"
          >
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-warm"
              strokeWidth={2}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onBuy}
        disabled={disabled}
        className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isHL
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border border-border bg-background text-foreground hover:bg-muted'
        }`}
      >
        {buttonLabel}
      </button>

      <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
        Instant delivery · Tokens never expire
      </p>
    </div>
  );
}

