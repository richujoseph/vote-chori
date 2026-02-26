import { router, protectedProcedure } from "../trpc";
import { votes, users, elections, candidates, categories } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";

export const analyticsRouter = router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const [votesCount] = await ctx.db.select({ count: count() }).from(votes);
        const [usersCount] = await ctx.db.select({ count: count() }).from(users);
        const [electionsCount] = await ctx.db.select({ count: count() }).from(elections);

        return {
            totalVotes: votesCount?.count ?? 0,
            totalUsers: usersCount?.count ?? 0,
            totalElections: electionsCount?.count ?? 0,
        };
    }),

    getCurrentResults: protectedProcedure.query(async ({ ctx }) => {
        // Get the most recent ongoing or completed election
        const [latestElection] = await ctx.db
            .select()
            .from(elections)
            .where(eq(elections.status, "ongoing"))
            .orderBy(desc(elections.createdAt))
            .limit(1);

        if (!latestElection) {
            // Fallback to latest completed if no ongoing
            const [completedElection] = await ctx.db
                .select()
                .from(elections)
                .where(eq(elections.status, "completed"))
                .orderBy(desc(elections.createdAt))
                .limit(1);

            if (!completedElection) return null;
            return await getElectionResults(ctx.db, completedElection.id);
        }

        return await getElectionResults(ctx.db, latestElection.id);
    }),
});

async function getElectionResults(db: any, electionId: string) {
    // Get all categories for this election
    const electionCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.electionId, electionId));

    if (electionCategories.length === 0) return null;

    // Just get the first category for the "Live Pulse" dashboard view
    const category = electionCategories[0];

    const categoryCandidates = await db
        .select()
        .from(candidates)
        .where(eq(candidates.categoryId, category.id));

    const candidateResults = [];
    for (const candidate of categoryCandidates) {
        const [voteCount] = await db
            .select({ count: count() })
            .from(votes)
            .where(eq(votes.candidateId, candidate.id));

        candidateResults.push({
            name: candidate.name,
            voteCount: voteCount?.count ?? 0,
        });
    }

    const totalVotes = candidateResults.reduce((sum, c) => sum + c.voteCount, 0);

    return {
        electionTitle: category.title,
        candidates: candidateResults.sort((a, b) => b.voteCount - a.voteCount).slice(0, 3),
        totalVotes,
    };
}
