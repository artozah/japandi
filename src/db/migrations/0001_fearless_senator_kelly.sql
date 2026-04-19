ALTER TABLE "chat_sessions" DROP CONSTRAINT "chat_sessions_current_source_upload_id_uploads_id_fk";
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_source_generation_id_fk" FOREIGN KEY ("source_generation_id") REFERENCES "public"."generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" DROP COLUMN "current_source_upload_id";