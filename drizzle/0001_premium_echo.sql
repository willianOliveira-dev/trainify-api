ALTER TABLE "user_workout_sessions" ALTER COLUMN "started_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_workout_sessions" ALTER COLUMN "started_at" DROP NOT NULL;