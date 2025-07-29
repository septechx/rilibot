import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const modRoles = pgTable("mod_roles", {
  id: serial().primaryKey().notNull(),
  guildId: varchar("guild_id", { length: 255 }).notNull().unique(),
  roleId: varchar("role_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const vanCommandData = pgTable("van_command_data", {
  id: serial().primaryKey().notNull(),
  guildId: varchar("guild_id", { length: 255 }).notNull().unique(),
  chance: integer("chance").notNull().default(1),
  timesRan: integer("times_ran").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

