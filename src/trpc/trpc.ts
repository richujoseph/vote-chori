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
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);
        if (result.length > 0) {
            dbUser = result[0];
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
