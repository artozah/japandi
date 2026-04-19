import crypto from 'node:crypto';

export type PlanKey = 'custom' | 'standard' | 'professional';

export interface Plan {
  key: PlanKey;
  name: string;
  priceLabel: string;
  tokens: number;
  kind: 'one_time' | 'subscription';
  tagline: string;
  priceIdEnv:
    | 'NEXT_PUBLIC_PADDLE_PRICE_CUSTOM'
    | 'NEXT_PUBLIC_PADDLE_PRICE_STANDARD'
    | 'NEXT_PUBLIC_PADDLE_PRICE_PROFESSIONAL';
  highlight?: boolean;
}

export const PLANS: readonly Plan[] = [
  {
    key: 'custom',
    name: 'Custom',
    priceLabel: '$9',
    tokens: 30,
    kind: 'one_time',
    tagline: 'One-time top-up. No subscription.',
    priceIdEnv: 'NEXT_PUBLIC_PADDLE_PRICE_CUSTOM',
  },
  {
    key: 'standard',
    name: 'Standard',
    priceLabel: '$19/mo',
    tokens: 100,
    kind: 'subscription',
    tagline: 'For regular monthly use.',
    priceIdEnv: 'NEXT_PUBLIC_PADDLE_PRICE_STANDARD',
  },
  {
    key: 'professional',
    name: 'Professional',
    priceLabel: '$49/mo',
    tokens: 500,
    kind: 'subscription',
    tagline: 'For heavy use and teams.',
    priceIdEnv: 'NEXT_PUBLIC_PADDLE_PRICE_PROFESSIONAL',
    highlight: true,
  },
] as const;

export function getPlan(key: string): Plan | undefined {
  return PLANS.find((p) => p.key === key);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => process.env[p.priceIdEnv] === priceId);
}

export interface PaddleClientConfig {
  token: string;
  environment: 'sandbox' | 'production';
}

export function readPaddleClientConfig(): PaddleClientConfig | null {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) return null;
  const rawEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;
  const environment: PaddleClientConfig['environment'] =
    rawEnv === 'production' ? 'production' : 'sandbox';
  return { token, environment };
}

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

export interface PaddleSignature {
  timestamp: number;
  h1: string;
}

function parsePaddleSignature(header: string | null): PaddleSignature | null {
  if (!header) return null;
  const parts = header.split(';').map((p) => p.trim());
  const out: Record<string, string> = {};
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k && v) out[k] = v;
  }
  const ts = Number(out.ts);
  if (!Number.isFinite(ts) || !out.h1) return null;
  return { timestamp: ts, h1: out.h1 };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return false;
  const parsed = parsePaddleSignature(signatureHeader);
  if (!parsed) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > MAX_CLOCK_SKEW_SECONDS) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parsed.timestamp}:${rawBody}`)
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const gotBuf = Buffer.from(parsed.h1, 'hex');
  if (expectedBuf.length !== gotBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, gotBuf);
}
