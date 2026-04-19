import { and, eq, gte, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await requireUserId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const rows = await db
    .select({
      status: schema.generations.status,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.generations)
    .where(
      and(
        eq(schema.generations.userId, userId),
        gte(schema.generations.createdAt, monthStart),
      ),
    )
    .groupBy(schema.generations.status);

  const byStatus: Record<string, number> = {};
  for (const row of rows) {
    byStatus[row.status] = Number(row.count);
  }

  const generations = byStatus.ready ?? 0;
  const refunded = byStatus.error ?? 0;
  const pending = (byStatus.pending ?? 0) + (byStatus.running ?? 0);

  return Response.json({
    monthStart: monthStart.toISOString(),
    generations,
    refunded,
    pending,
  });
}
