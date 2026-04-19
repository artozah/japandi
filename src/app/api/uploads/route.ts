import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { ensureUserRow, requireUserId } from '@/lib/auth';

export const runtime = 'nodejs';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export async function GET() {
  const userId = await requireUserId();
  const rows = await db
    .select({
      id: schema.uploads.id,
      blobUrl: schema.uploads.blobUrl,
      createdAt: schema.uploads.createdAt,
    })
    .from(schema.uploads)
    .where(eq(schema.uploads.userId, userId))
    .orderBy(desc(schema.uploads.createdAt));
  return Response.json({ uploads: rows });
}

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        const userId = await requireUserId();
        await ensureUserRow(userId);
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: undefined,
    });
    return Response.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return Response.json({ error: message }, { status: 400 });
  }
}
