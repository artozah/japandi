import { Resend } from 'resend';
import {
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  SUPPORT_EMAIL,
} from '@/lib/contact';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resendClient: Resend | null = null;
function getResend(apiKey: string): Resend {
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

interface Body {
  email?: unknown;
  message?: unknown;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Contact is not configured. Please email us directly.' },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return Response.json(
      { error: 'A valid email is required.' },
      { status: 400 },
    );
  }

  const message =
    typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return Response.json({ error: 'Message is required.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const resend = getResend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: SUPPORT_EMAIL,
    replyTo: email,
    subject: `Contact form: ${email}`,
    text: message,
  });

  if (error) {
    console.error('[contact] resend error', error);
    return Response.json(
      { error: 'Could not send your message. Please try again.' },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
