CREATE TABLE "van_command_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" varchar(255) NOT NULL,
	"chance" integer DEFAULT 1 NOT NULL,
	"times_ran" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "van_command_data_guild_id_unique" UNIQUE("guild_id")
);
