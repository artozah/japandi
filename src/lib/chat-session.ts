import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import type { ChatMessageRow } from '@/db/schema';

export async function findChatSessionId(
  userId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: schema.chatSessions.id })
    .from(schema.chatSessions)
    .where(eq(schema.chatSessions.userId, userId))
    .orderBy(asc(schema.chatSessions.createdAt))
    .limit(1);
  return row?.id ?? null;
}

export async function ensureChatSession(userId: string): Promise<string> {
  const existing = await findChatSessionId(userId);
  if (existing) return existing;
  const [created] = await db
    .insert(schema.chatSessions)
    .values({ userId })
    .returning({ id: schema.chatSessions.id });
  return created.id;
}

export async function listMessages(
  sessionId: string,
): Promise<ChatMessageRow[]> {
  return await db
    .select()
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.sessionId, sessionId))
    .orderBy(asc(schema.chatMessages.createdAt));
}

export async function clearSessionMessages(sessionId: string): Promise<void> {
  await Promise.all([
    db
      .delete(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, sessionId)),
    db
      .update(schema.chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.chatSessions.id, sessionId)),
  ]);
}

interface ProposedPromptJson {
  prompt: string;
  label: string;
}

export interface PersistMessageArgs {
  sessionId: string;
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'complete' | 'error';
  proposedPrompt?: ProposedPromptJson | null;
}

export async function persistMessage({
  sessionId,
  id,
  role,
  content,
  status = 'complete',
  proposedPrompt = null,
}: PersistMessageArgs): Promise<void> {
  await db
    .insert(schema.chatMessages)
    .values({
      id,
      sessionId,
      role,
      content,
      status,
      proposedPromptJson: proposedPrompt,
    })
    .onConflictDoUpdate({
      target: schema.chatMessages.id,
      set: { content, status, proposedPromptJson: proposedPrompt },
    });
}

export function messageRowToDto(row: ChatMessageRow) {
  const proposed = row.proposedPromptJson as ProposedPromptJson | null;
  return {
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    status: row.status as 'complete' | 'error',
    proposedPrompt: proposed,
    createdAt: row.createdAt,
  };
}
