import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { elections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const electionRouter = router({
    create: adminProcedure
        .input(
            z.object({
                title: z.string().min(1).max(200),
                description: z.string().max(1000).default(""),
                startTime: z.string().datetime().optional(),
                endTime: z.string().datetime().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [election] = await ctx.db
                .insert(elections)
                .values({
                    title: input.title,
                    description: input.description,
                    startTime: input.startTime ? new Date(input.startTime) : null,
                    endTime: input.endTime ? new Date(input.endTime) : null,
                    createdBy: ctx.user.id,
                    status: "upcoming",
                })
                .returning();

            return election;
        }),

    updateStatus: adminProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                status: z.enum(["upcoming", "ongoing", "completed"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [updated] = await ctx.db
                .update(elections)
                .set({ status: input.status })
                .where(eq(elections.id, input.id))
                .returning();

            return updated;
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db
            .select()
            .from(elections)
            .orderBy(desc(elections.createdAt));
    }),

    getOngoing: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db
            .select()
            .from(elections)
            .where(eq(elections.status, "ongoing"))
            .orderBy(desc(elections.createdAt));
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const [election] = await ctx.db
                .select()
                .from(elections)
                .where(eq(elections.id, input.id))
                .limit(1);

            return election ?? null;
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(elections).where(eq(elections.id, input.id));
            return { success: true };
        }),
});
