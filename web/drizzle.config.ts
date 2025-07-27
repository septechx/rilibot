import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
