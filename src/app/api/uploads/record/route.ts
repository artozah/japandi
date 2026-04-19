import { db, schema } from '@/db';
import { ensureUserRow, requireUserId } from '@/lib/auth';
import { isVercelBlobUrl } from '@/lib/validation';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

interface RecordBody {
  url?: string;
  pathname?: string;
  contentType?: string | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  await ensureUserRow(userId);

  const body = (await request.json()) as RecordBody;
  if (!body.url || !body.pathname) {
    return Response.json(
      { error: 'url and pathname are required' },
      { status: 400 },
    );
  }
  if (!isVercelBlobUrl(body.url, body.pathname)) {
    return Response.json(
      { error: 'Invalid blob URL' },
      { status: 400 },
    );
  }

  const existing = await db
    .select()
    .from(schema.uploads)
    .where(
      and(
        eq(schema.uploads.userId, userId),
        eq(schema.uploads.blobPathname, body.pathname),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ upload: existing[0] });
  }

  const [inserted] = await db
    .insert(schema.uploads)
    .values({
      userId,
      blobUrl: body.url,
      blobPathname: body.pathname,
      mimeType: body.contentType ?? null,
      width: body.width ?? null,
      height: body.height ?? null,
      sizeBytes: body.sizeBytes ?? null,
    })
    .returning();

  return Response.json({ upload: inserted });
}
