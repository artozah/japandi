import { ensureUserRow, requireUserId } from '@/lib/auth';
import {
  clearSessionMessages,
  ensureChatSession,
  findChatSessionId,
  listMessages,
  messageRowToDto,
} from '@/lib/chat-session';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await requireUserId();
  await ensureUserRow(userId);
  const sessionId = await ensureChatSession(userId);
  const rows = await listMessages(sessionId);
  return Response.json({
    session: { id: sessionId },
    messages: rows.map(messageRowToDto),
  });
}

export async function DELETE() {
  const userId = await requireUserId();
  const sessionId = await findChatSessionId(userId);
  if (sessionId) await clearSessionMessages(sessionId);
  return Response.json({ ok: true });
}
