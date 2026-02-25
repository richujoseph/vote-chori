import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
    getSession: protectedProcedure.query(({ ctx }) => {
        return ctx.session;
    }),

    me: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db
            .select()
            .from(users)
            .where(eq(users.id, ctx.user.id))
            .limit(1);

        if (!user.length) {
            return null;
        }

        return user[0];
    }),
});
