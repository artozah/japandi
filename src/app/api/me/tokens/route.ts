import { ensureUserRow, requireUserId } from '@/lib/auth';
import { getBalance } from '@/lib/tokens';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await requireUserId();
  await ensureUserRow(userId);
  const tokens = await getBalance(userId);
  return Response.json({ tokens });
}
