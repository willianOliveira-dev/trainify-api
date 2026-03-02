CREATE TYPE "public"."week_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_workout_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workout_day_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "user_workout_sessions_completed_after_started_chk" CHECK ("user_workout_sessions"."completed_at" IS NULL OR "user_workout_sessions"."completed_at" > "user_workout_sessions"."started_at")
);
--> statement-breakpoint
CREATE TABLE "workout_days" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"workout_plan_id" text NOT NULL,
	"is_rest" boolean DEFAULT false NOT NULL,
	"week_day" "week_day" NOT NULL,
	"estimated_duration_in_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_days_duration_positive_chk" CHECK ("workout_days"."estimated_duration_in_seconds" IS NULL OR "workout_days"."estimated_duration_in_seconds" > 0)
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"name" text NOT NULL,
	"sets" integer NOT NULL,
	"reps" integer NOT NULL,
	"rest_time_in_seconds" integer NOT NULL,
	"workout_day_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_exercises_sets_positive_chk" CHECK ("workout_exercises"."sets" > 0),
	CONSTRAINT "workout_exercises_reps_positive_chk" CHECK ("workout_exercises"."reps" > 0),
	CONSTRAINT "workout_exercises_rest_positive_chk" CHECK ("workout_exercises"."rest_time_in_seconds" >= 0),
	CONSTRAINT "workout_exercises_order_positive_chk" CHECK ("workout_exercises"."order" > 0)
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_workout_sessions" ADD CONSTRAINT "user_workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_sessions" ADD CONSTRAINT "user_workout_sessions_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_workout_sessions_user_id_idx" ON "user_workout_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_workout_sessions_day_id_idx" ON "user_workout_sessions" USING btree ("workout_day_id");--> statement-breakpoint
CREATE INDEX "user_workout_sessions_user_active_idx" ON "user_workout_sessions" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "user_workout_sessions_started_at_idx" ON "user_workout_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "workout_days_plan_id_idx" ON "workout_days" USING btree ("workout_plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_days_plan_weekday_unique_idx" ON "workout_days" USING btree ("workout_plan_id","week_day");--> statement-breakpoint
CREATE INDEX "workout_days_plan_rest_idx" ON "workout_days" USING btree ("workout_plan_id","is_rest");--> statement-breakpoint
CREATE INDEX "workout_exercises_day_id_order_idx" ON "workout_exercises" USING btree ("workout_day_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_exercises_day_order_unique_idx" ON "workout_exercises" USING btree ("workout_day_id","order");--> statement-breakpoint
CREATE INDEX "workout_plans_user_id_idx" ON "workout_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workout_plans_user_active_idx" ON "workout_plans" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_plans_user_name_unique_idx" ON "workout_plans" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "workout_plans_created_at_idx" ON "workout_plans" USING btree ("created_at");