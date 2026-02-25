import { initTRPC, TRPCError } from "@trpc/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import superjson from "superjson";

export const createTRPCContext = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let dbUser = null;

    if (user) {
        try {
            // First, try to fetch the existing user
            const result = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image,
                    role: users.role,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(eq(users.email, user.email!))
                .limit(1);

            if (result.length > 0) {
                dbUser = result[0];
            } else {
                // Auto-sync: Create user if missing
                const isDeveloper = user.email === "timstittus2027@cy.sjcetpalai.ac.in";
                const role = isDeveloper ? "admin" : "student";

                const [newUser] = await db
                    .insert(users)
                    .values({
                        id: user.id, // Match Supabase ID
                        email: user.email!,
                        name: user.user_metadata.full_name || user.user_metadata.name || user.email!.split('@')[0],
                        image: user.user_metadata.avatar_url || null,
                        role: role as any,
                    })
                    .returning();

                if (newUser) {
                    dbUser = newUser;
                }
            }
        } catch (error) {
            console.error("TRPC Context: Sync/Fetch failed:", error);
            // Fallback synthesized profile for developer
            if (user.email === "timstittus2027@cy.sjcetpalai.ac.in") {
                dbUser = {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata.full_name || user.user_metadata.name || user.email!.split('@')[0],
                    role: "admin",
                    image: user.user_metadata.avatar_url || null,
                    createdAt: new Date(user.created_at),
                } as any;
            }
        }
    }

    return {
        db,
        user,
        dbUser,
    };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
            dbUser: ctx.dbUser,
        },
    });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    if (ctx.dbUser.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
            dbUser: ctx.dbUser,
        },
    });
});
