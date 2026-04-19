import { auth } from '@clerk/nextjs/server';
import { db, schema } from '@/db';

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function ensureUserRow(userId: string): Promise<void> {
  await db
    .insert(schema.users)
    .values({ id: userId })
    .onConflictDoNothing({ target: schema.users.id });
}
