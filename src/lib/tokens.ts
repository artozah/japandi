import { and, eq, gte, sql } from 'drizzle-orm';
import { db, schema, type DbExecutor } from '@/db';

export async function spendToken(
  userId: string,
  executor: DbExecutor = db,
): Promise<boolean> {
  const updated = await executor
    .update(schema.users)
    .set({ tokens: sql`${schema.users.tokens} - 1` })
    .where(and(eq(schema.users.id, userId), gte(schema.users.tokens, 1)))
    .returning({ id: schema.users.id });
  return updated.length === 1;
}

export async function refundToken(
  userId: string,
  executor: DbExecutor = db,
): Promise<void> {
  await executor
    .update(schema.users)
    .set({ tokens: sql`${schema.users.tokens} + 1` })
    .where(eq(schema.users.id, userId));
}

export async function grantTokens(
  userId: string,
  delta: number,
  executor: DbExecutor = db,
): Promise<void> {
  if (delta <= 0) return;
  await executor
    .update(schema.users)
    .set({ tokens: sql`${schema.users.tokens} + ${delta}` })
    .where(eq(schema.users.id, userId));
}

export async function setTokens(
  userId: string,
  amount: number,
  executor: DbExecutor = db,
): Promise<void> {
  await executor
    .update(schema.users)
    .set({ tokens: Math.max(0, amount) })
    .where(eq(schema.users.id, userId));
}

export async function getBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ tokens: schema.users.tokens })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return row?.tokens ?? 0;
}
