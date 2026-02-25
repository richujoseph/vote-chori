import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

// For Supabase, we often need to ensure the connection string is handled correctly
const queryClient = postgres(dbUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: "require",
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;

