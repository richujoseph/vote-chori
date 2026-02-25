import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const categoryRouter = router({
    create: adminProcedure
        .input(
            z.object({
                electionId: z.string().uuid(),
                title: z.string().min(1).max(200),
                maxVotes: z.number().int().positive().default(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [category] = await ctx.db
                .insert(categories)
                .values({
                    electionId: input.electionId,
                    title: input.title,
                    maxVotes: input.maxVotes,
                })
                .returning();

            return category;
        }),

    getByElection: protectedProcedure
        .input(z.object({ electionId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(categories)
                .where(eq(categories.electionId, input.electionId));
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(categories).where(eq(categories.id, input.id));
            return { success: true };
        }),
});
