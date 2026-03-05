CREATE TYPE "public"."week_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_train_data" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"weight_in_grams" integer NOT NULL,
	"height_in_centimeters" integer NOT NULL,
	"age" integer NOT NULL,
	"body_fat_percentage" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_workout_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workout_plan_id" text NOT NULL,
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
	"cover_image_url" text,
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
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_train_data" ADD CONSTRAINT "user_train_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_sessions" ADD CONSTRAINT "user_workout_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_sessions" ADD CONSTRAINT "user_workout_sessions_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_sessions" ADD CONSTRAINT "user_workout_sessions_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "user" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_train_data_user_id_unique_idx" ON "user_train_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_train_data_user_id_idx" ON "user_train_data" USING btree ("user_id");--> statement-breakpoint
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