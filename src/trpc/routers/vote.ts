import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { votes, candidates, categories, elections } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const voteRouter = router({
    castVote: protectedProcedure
        .input(
            z.object({
                categoryId: z.string().uuid(),
                candidateId: z.string().uuid(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            // 1. Verify the candidate belongs to the category
            const [candidate] = await ctx.db
                .select()
                .from(candidates)
                .where(
                    and(
                        eq(candidates.id, input.candidateId),
                        eq(candidates.categoryId, input.categoryId)
                    )
                )
                .limit(1);

            if (!candidate) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid candidate for this category",
                });
            }

            // 2. Verify the election is ongoing
            const [category] = await ctx.db
                .select()
                .from(categories)
                .where(eq(categories.id, input.categoryId))
                .limit(1);

            if (!category) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Category not found",
                });
            }

            const [election] = await ctx.db
                .select()
                .from(elections)
                .where(eq(elections.id, category.electionId))
                .limit(1);

            if (!election || election.status !== "ongoing") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Election is not currently active",
                });
            }

            // 3. Check if user already voted in this category
            const existingVote = await ctx.db
                .select()
                .from(votes)
                .where(
                    and(
                        eq(votes.userId, userId),
                        eq(votes.categoryId, input.categoryId)
                    )
                )
                .limit(1);

            if (existingVote.length > 0) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already voted in this category",
                });
            }

            // 4. Cast the vote
            const [vote] = await ctx.db
                .insert(votes)
                .values({
                    userId,
                    categoryId: input.categoryId,
                    candidateId: input.candidateId,
                })
                .returning();

            return vote;
        }),

    getUserVotes: protectedProcedure
        .input(z.object({ electionId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            // Get all categories for this election
            const electionCategories = await ctx.db
                .select()
                .from(categories)
                .where(eq(categories.electionId, input.electionId));

            const categoryIds = electionCategories.map((c) => c.id);

            if (categoryIds.length === 0) return [];

            // Get user's votes for these categories
            const userVotes = await ctx.db
                .select()
                .from(votes)
                .where(eq(votes.userId, userId));

            return userVotes.filter((v) => categoryIds.includes(v.categoryId));
        }),

    getResults: protectedProcedure
        .input(z.object({ electionId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            // Get election status
            const [election] = await ctx.db
                .select()
                .from(elections)
                .where(eq(elections.id, input.electionId))
                .limit(1);

            if (!election) throw new TRPCError({ code: "NOT_FOUND", message: "Election not found" });

            const isOngoing = election.status === "ongoing";

            // Get all categories for this election
            const electionCategories = await ctx.db
                .select()
                .from(categories)
                .where(eq(categories.electionId, input.electionId));

            const results = [];

            for (const category of electionCategories) {
                // Get all candidates for this category
                const categoryCandidates = await ctx.db
                    .select()
                    .from(candidates)
                    .where(eq(candidates.categoryId, category.id));

                const candidateResults = [];

                for (const candidate of categoryCandidates) {
                    const [voteCount] = await ctx.db
                        .select({ count: count() })
                        .from(votes)
                        .where(eq(votes.candidateId, candidate.id));

                    candidateResults.push({
                        ...candidate,
                        voteCount: voteCount?.count ?? 0,
                    });
                }

                // Sort by vote count descending
                candidateResults.sort((a, b) => b.voteCount - a.voteCount);

                results.push({
                    category,
                    candidates: candidateResults,
                    totalVotes: candidateResults.reduce((sum, c) => sum + c.voteCount, 0),
                    resultsHidden: false, // Default to false as we want them visible as percentages
                });
            }

            return {
                election,
                results,
                resultsHidden: false, // Default to false
            };
        }),
});
