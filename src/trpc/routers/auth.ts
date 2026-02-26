import { router, protectedProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { extractStudentDetails } from "@/lib/auth-utils";

export const authRouter = router({
    getSession: protectedProcedure.query(({ ctx }) => {
        return ctx.user;
    }),

    me: protectedProcedure.query(async ({ ctx }) => {
        // if (ctx.dbUser) return { ...ctx.dbUser, dbConnected: true };

        // Auto-sync user if they are missing from DB but authenticated in Supabase
        const email = ctx.user.email!;
        const studentDetails = extractStudentDetails(email);

        try {
            const [newUser] = await ctx.db.insert(users).values({
                email,
                name: ctx.user.user_metadata.full_name || ctx.user.user_metadata.name || email.split('@')[0],
                image: ctx.user.user_metadata.avatar_url || ctx.user.user_metadata.picture || null,
                ...studentDetails,
            }).onConflictDoUpdate({
                target: users.email,
                set: {
                    name: ctx.user.user_metadata.full_name || ctx.user.user_metadata.name || email.split('@')[0],
                    image: ctx.user.user_metadata.avatar_url || ctx.user.user_metadata.picture || null,
                    ...studentDetails,
                }
            }).returning();

            if (newUser) return { ...newUser, dbConnected: true };
        } catch (dbError) {
            console.error("TRPC Auth: Auto-sync failed:", dbError);
        }

        // Fallback to synthesized profile if DB sync fails or user is not found
        const isDeveloper = email === "timstittus2027@cy.sjcetpalai.ac.in";

        return {
            id: ctx.user.id,
            email: ctx.user.email ?? "",
            name: ctx.user.user_metadata.full_name || ctx.user.user_metadata.name || ctx.user.email?.split('@')[0] || "User",
            image: ctx.user.user_metadata.avatar_url || ctx.user.user_metadata.picture || null,
            role: isDeveloper ? "admin" : "student",
            createdAt: new Date(ctx.user.created_at),
            department: studentDetails.department,
            batch: studentDetails.batch,
            dbConnected: false,
        };
    }),
});
