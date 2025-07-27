import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const modRoles = pgTable("mod_roles", {
  id: serial().primaryKey().notNull(),
  guildId: varchar("guild_id", { length: 255 }).notNull().unique(),
  roleId: varchar("role_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
