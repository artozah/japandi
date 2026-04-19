import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await requireUserId();
  const [row] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .orderBy(desc(schema.subscriptions.updatedAt))
    .limit(1);
  return Response.json({ subscription: row ?? null });
}
