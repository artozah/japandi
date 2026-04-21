'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { Subscription } from '@/db/schema';
import {
  isActiveSubscriptionStatus,
  PLANS,
  type PlanKey,
} from '@/lib/paddle';
import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';
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
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {PLANS.map((plan) => {
        const isLoading = loadingKey === plan.key;
        const isCurrent =
          !!subscription &&
          subscription.planKey === plan.key &&
          isActiveSubscriptionStatus(subscription.status);
        return (
          <div
            key={plan.key}
            className={cn(
              'relative flex flex-col rounded-xl border bg-card p-8',
              plan.highlight
                ? 'border-foreground shadow-lg'
                : 'border-border',
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-0.5 text-[11px] font-medium text-background">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </span>
            )}

            <h3 className="text-lg font-semibold text-foreground">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

            <div className="mt-6">
              <span className="text-4xl font-bold text-foreground">
                {plan.priceLabel}
              </span>
            </div>

            <ul className="mt-6 flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-foreground" />
                <span className="font-medium">{plan.tokens} tokens</span>
                {plan.kind === 'subscription' && (
                  <span className="text-muted-foreground">/ month</span>
                )}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-foreground" />
                {plan.kind === 'one_time'
                  ? 'Pay once, use anytime'
                  : 'Resets monthly, cancel anytime'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-foreground" />
                Refund on failed generations
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleBuy(plan.key)}
              disabled={isCurrent || isLoading || !paddleReady}
              className={cn(
                'mt-8 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                plan.highlight
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-border text-foreground hover:bg-muted',
              )}
            >
              {isCurrent
                ? 'Current plan'
                : isLoading
                  ? 'Opening…'
                  : plan.kind === 'one_time'
                    ? 'Buy'
                    : 'Subscribe'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
