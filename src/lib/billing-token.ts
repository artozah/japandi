import crypto from 'node:crypto';

const DEFAULT_TTL_SECONDS = 10 * 60;

export interface CheckoutTokenPayload {
  userId: string;
  planKey: string;
  email?: string;
  exp: number;
}

function getSigningSecret(): string {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) throw new Error('PADDLE_WEBHOOK_SECRET is not set.');
  return secret;
}

export function signCheckoutToken(
  payload: Omit<CheckoutTokenPayload, 'exp'>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const full: CheckoutTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(full), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

export function verifyCheckoutToken(
  token: unknown,
): CheckoutTokenPayload | null {
  if (typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let expected: string;
  try {
    expected = crypto
      .createHmac('sha256', getSigningSecret())
      .update(body)
      .digest('base64url');
  } catch {
    return null;
  }

  const expectedBuf = Buffer.from(expected);
  const gotBuf = Buffer.from(sig);
  if (expectedBuf.length !== gotBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, gotBuf)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as Record<string, unknown>).userId !== 'string' ||
    typeof (parsed as Record<string, unknown>).planKey !== 'string' ||
    typeof (parsed as Record<string, unknown>).exp !== 'number'
  ) {
    return null;
  }

  const payload = parsed as CheckoutTokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
