import { aliasedTable, and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';

export const runtime = 'nodejs';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function parseOffset(raw: string | null): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export async function GET(request: Request) {
  const userId = await requireUserId();
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get('limit'));
  const offset = parseOffset(url.searchParams.get('offset'));
  const sourceUploadId = url.searchParams.get('sourceUploadId');

  const filters = [
    eq(schema.generations.userId, userId),
    eq(schema.generations.status, 'ready'),
    isNotNull(schema.generations.outputBlobUrl),
  ];
  if (sourceUploadId && UUID_RE.test(sourceUploadId)) {
    filters.push(eq(schema.generations.sourceUploadId, sourceUploadId));
  }
  const where = and(...filters);

  const parentGeneration = aliasedTable(schema.generations, 'parent_generation');

  // Single-hop source resolution is intentional: the `before` image we want to
  // show is the generation's immediate input. If the parent is itself a
  // generation, its `output_blob_url` IS the visual source for this row — no
  // deeper traversal is needed.
  interface Row {
    id: string;
    styleLabel: string;
    outputBlobUrl: string | null;
    sourceUploadId: string | null;
    sourceGenerationId: string | null;
    prompt: string | null;
    createdAt: Date;
    sourceImageUrl: string | null;
    total: number | string;
  }

  const rows = (await db
    .select({
      id: schema.generations.id,
      styleLabel: schema.generations.styleLabel,
      outputBlobUrl: schema.generations.outputBlobUrl,
      sourceUploadId: schema.generations.sourceUploadId,
      sourceGenerationId: schema.generations.sourceGenerationId,
      prompt: schema.generations.prompt,
      createdAt: schema.generations.createdAt,
      sourceImageUrl: sql<string | null>`
        COALESCE(${schema.uploads.blobUrl}, ${parentGeneration.outputBlobUrl})
      `,
      total: sql<number>`count(*) OVER()`,
    })
    .from(schema.generations)
    .leftJoin(
      schema.uploads,
      eq(schema.uploads.id, schema.generations.sourceUploadId),
    )
    .leftJoin(
      parentGeneration,
      eq(parentGeneration.id, schema.generations.sourceGenerationId),
    )
    .where(where)
    .orderBy(desc(schema.generations.createdAt))
    .limit(limit)
    .offset(offset)) as Row[];

  const total = rows.length > 0 ? Number(rows[0].total) : 0;
  const generations = rows.map(({ total: _discard, ...rest }) => {
    void _discard;
    return rest;
  });

  return Response.json({ generations, total, limit, offset });
}
