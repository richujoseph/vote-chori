import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    pgEnum,
    uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const electionStatusEnum = pgEnum("election_status", [
    "upcoming",
    "ongoing",
    "completed",
]);

// ─── Users ───────────────────────────────────────────────
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("student"),
    department: text("department"),
    batch: text("batch"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// ─── NextAuth Tables ────────────────────────────────────
export const accounts = pgTable("accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
    sessionToken: text("session_token").notNull().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
    "verification_tokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull().unique(),
        expires: timestamp("expires", { withTimezone: true }).notNull(),
    }
);

// ─── Elections ──────────────────────────────────────────
export const elections = pgTable("elections", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: electionStatusEnum("status").notNull().default("upcoming"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// ─── Categories ─────────────────────────────────────────
export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    electionId: uuid("election_id")
        .notNull()
        .references(() => elections.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    maxVotes: integer("max_votes").notNull().default(1),
});

// ─── Candidates ─────────────────────────────────────────
export const candidates = pgTable("candidates", {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    bio: text("bio").notNull().default(""),
});

// ─── Votes ──────────────────────────────────────────────
export const votes = pgTable(
    "votes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        categoryId: uuid("category_id")
            .notNull()
            .references(() => categories.id),
        candidateId: uuid("candidate_id")
            .notNull()
            .references(() => candidates.id),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        uniqueUserCategory: uniqueIndex("unique_user_category").on(
            table.userId,
            table.categoryId
        ),
    })
);

// ─── Type Exports ───────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Election = typeof elections.$inferSelect;
export type NewElection = typeof elections.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Vote = typeof votes.$inferSelect;
