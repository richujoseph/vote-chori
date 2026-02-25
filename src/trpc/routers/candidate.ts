import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";

export const candidateRouter = router({
    create: adminProcedure
        .input(
            z.object({
                categoryId: z.string().uuid(),
                name: z.string().min(1).max(200),
                photoUrl: z.string().url().optional().or(z.literal("")),
                bio: z.string().max(500).default(""),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [candidate] = await ctx.db
                .insert(candidates)
                .values({
                    categoryId: input.categoryId,
                    name: input.name,
                    photoUrl: input.photoUrl || null,
                    bio: input.bio,
                })
                .returning();

            return candidate;
        }),

    getByCategory: protectedProcedure
        .input(z.object({ categoryId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(candidates)
                .where(eq(candidates.categoryId, input.categoryId));
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(candidates).where(eq(candidates.id, input.id));
            return { success: true };
        }),

    update: adminProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string().min(1).max(200).optional(),
                photoUrl: z.string().url().optional().or(z.literal("")),
                bio: z.string().max(500).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            const updateData: Record<string, unknown> = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl || null;
            if (data.bio !== undefined) updateData.bio = data.bio;

            const [updated] = await ctx.db
                .update(candidates)
                .set(updateData)
                .where(eq(candidates.id, id))
                .returning();

            return updated;
        }),
});
