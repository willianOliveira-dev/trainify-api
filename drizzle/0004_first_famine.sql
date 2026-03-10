CREATE TABLE "user_workout_session_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"set_number" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_workout_session_sets" ADD CONSTRAINT "user_workout_session_sets_session_id_user_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_session_sets" ADD CONSTRAINT "user_workout_session_sets_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_sets_session_id_idx" ON "user_workout_session_sets" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_sets_exercise_id_idx" ON "user_workout_session_sets" USING btree ("exercise_id");