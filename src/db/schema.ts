import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const uploads = pgTable(
  'uploads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blobUrl: text('blob_url').notNull(),
    blobPathname: text('blob_pathname').notNull(),
    mimeType: text('mime_type'),
    width: integer('width'),
    height: integer('height'),
    sizeBytes: integer('size_bytes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('uploads_user_created_idx').on(t.userId, t.createdAt.desc())],
);

export const generations = pgTable(
  'generations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sourceUploadId: uuid('source_upload_id').references(() => uploads.id, {
      onDelete: 'set null',
    }),
    sourceGenerationId: uuid('source_generation_id'),
    styleKey: text('style_key').notNull(),
    styleLabel: text('style_label').notNull(),
    prompt: text('prompt'),
    status: text('status').notNull().default('pending'),
    percentage: integer('percentage').notNull().default(0),
    provider: text('provider').notNull(),
    providerPredictionId: text('provider_prediction_id'),
    outputBlobUrl: text('output_blob_url'),
    outputBlobPathname: text('output_blob_pathname'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('generations_user_created_idx').on(t.userId, t.createdAt.desc()),
    uniqueIndex('generations_prediction_id_idx').on(t.providerPredictionId),
    check(
      'generations_exactly_one_source',
      sql`(${t.sourceUploadId} IS NOT NULL) <> (${t.sourceGenerationId} IS NOT NULL)`,
    ),
    foreignKey({
      columns: [t.sourceGenerationId],
      foreignColumns: [t.id],
      name: 'generations_source_generation_id_fk',
    }).onDelete('set null'),
  ],
);

export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull().default(''),
    status: text('status').notNull().default('complete'),
    proposedPromptJson: jsonb('proposed_prompt_json'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('chat_messages_session_idx').on(t.sessionId, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessageRow = typeof chatMessages.$inferSelect;
