import Replicate from 'replicate';

let client: Replicate | null = null;

export function getReplicate(): Replicate {
  if (client) return client;
  const auth = process.env.REPLICATE_API_TOKEN;
  if (!auth) throw new Error('REPLICATE_API_TOKEN is not set.');
  client = new Replicate({ auth, useFileOutput: false });
  return client;
}

export function getWebhookUrl(): string | null {
  if (!process.env.REPLICATE_WEBHOOK_SECRET) return null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return null;
  try {
    const url = new URL(appUrl);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return null;
    }
  } catch {
    return null;
  }
  return `${appUrl.replace(/\/$/, '')}/api/replicate/webhook`;
}

export function getWebhookSecret(): string | null {
  return process.env.REPLICATE_WEBHOOK_SECRET ?? null;
}
