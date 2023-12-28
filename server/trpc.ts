import { TRPCError, initTRPC, type inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type Pocketbase from "pocketbase";
import transformer from "superjson";
import { initPocketBase } from "./pocketbase";
import { APIError, DataCollections } from "utils";

export const createContext = async (opts: CreateNextContextOptions) => {
  const pbClient: Pocketbase = await initPocketBase(opts.req, opts.res);

  return {
    pbClient,
    req: opts.req,
    res: opts.res,
  };
};

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({ transformer });

const isAuthenticated = t.middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.pbClient.authStore.isValid) {
    throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
  }
  return opts.next({ ctx: { user: ctx.pbClient.authStore.model } });
});

const isBusinessOwner = t.middleware(async (opts) => {
  const { ctx } = opts;

  try {
    const user = ctx.pbClient.authStore.model;

    const permissions = await ctx.pbClient
      .collection(DataCollections.USER_BUSINESSES)
      .getFullList(200, {
        filter: `user="${user?.id}"&&business="${
          (opts.rawInput as any)?.businessId
        }"`,
      });

    if (!permissions.length) {
      throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }
    return opts.next();
  } catch (error) {
    throw new APIError(error, "Failed to fetch permissions");
  }
});

const isProjectOwner = t.middleware(async (opts) => {
  const { ctx } = opts;

  try {
    const user = ctx.pbClient.authStore.model;

    const projects = await ctx.pbClient
      .collection(DataCollections.PROJECTS)
      .getFullList(200, {
        filter: `user="${user?.id}"&&id="${(opts.rawInput as any)?.projectId}"`,
      });

    if (!projects.length) {
      throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }
    return opts.next();
  } catch (error) {
    throw new APIError(error, "Failed to fetch projects");
  }
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const businessProtectedProcedure = t.procedure
  .use(isAuthenticated)
  .use(isBusinessOwner);
export const projectProtectedProcedure = t.procedure
  .use(isAuthenticated)
  .use(isProjectOwner);
export const mergeRouters = t.mergeRouters;
