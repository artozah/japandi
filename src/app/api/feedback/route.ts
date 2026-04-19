import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 200;

interface Body {
  message?: unknown;
  contactEmail?: unknown;
}

export async function POST(request: Request) {
  const userId = await requireUserId();

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
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

  let contactEmail: string | null = null;
  if (typeof body.contactEmail === 'string' && body.contactEmail.trim()) {
    const trimmed = body.contactEmail.trim();
    if (trimmed.length > MAX_EMAIL_LENGTH) {
      return Response.json(
        { error: 'Contact email is too long.' },
        { status: 400 },
      );
    }
    contactEmail = trimmed;
  }

  await db.insert(schema.feedback).values({
    userId,
    message,
    contactEmail,
  });

  return Response.json({ ok: true });
}
