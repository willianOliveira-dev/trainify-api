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
ALTER TABLE "user_train_data" ADD CONSTRAINT "user_train_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_train_data_user_id_unique_idx" ON "user_train_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_train_data_user_id_idx" ON "user_train_data" USING btree ("user_id");