import { router } from "../trpc";
import { authRouter } from "./auth";
import { electionRouter } from "./election";
import { categoryRouter } from "./category";
import { candidateRouter } from "./candidate";
import { voteRouter } from "./vote";
import { analyticsRouter } from "./analytics";

export const appRouter = router({
    auth: authRouter,
    election: electionRouter,
    category: categoryRouter,
    candidate: candidateRouter,
    vote: voteRouter,
    analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
