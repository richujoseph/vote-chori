import "server-only";

import { createTRPCContext } from "./trpc";
import { appRouter } from "./routers/_app";

export const serverTrpc = appRouter.createCaller(createTRPCContext);
