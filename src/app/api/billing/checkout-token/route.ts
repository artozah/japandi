import { currentUser } from '@clerk/nextjs/server';
import { ensureUserRow, requireUserId } from '@/lib/auth';
import { signCheckoutToken } from '@/lib/billing-token';
import { getPlan } from '@/lib/paddle';

export const runtime = 'nodejs';

interface Body {
  planKey?: unknown;
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  await ensureUserRow(userId);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const plan =
    typeof body.planKey === 'string' ? getPlan(body.planKey) : undefined;
  if (!plan) {
    return Response.json({ error: 'Unknown planKey.' }, { status: 400 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const token = signCheckoutToken({ userId, planKey: plan.key, email });
  return Response.json({ token });
}
