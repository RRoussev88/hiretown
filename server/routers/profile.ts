import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { UserBusiness } from "types";
import { APIError, DataCollections } from "utils";
import { protectedProcedure, router } from "../trpc";

const fetchProfileBusinesses = async (
  pbClient: Pocketbase,
  userId: string
): Promise<UserBusiness[]> => {
  try {
    const userBusinesses: UserBusiness[] = await pbClient
      .collection(DataCollections.USER_BUSINESSES)
      .getFullList(200, {
        expand: "business",
        sort: "business.name",
        filter: `user="${userId}"`,
      });

    return userBusinesses;
  } catch (error) {
    throw new APIError(error, "Failed to find any user businesses");
  }
};

export const profileRouter = router({
  userBusinesses: protectedProcedure
    .input(z.object({ userId: z.string(), page: z.number().optional() }))
    .query(({ ctx, input }) =>
      fetchProfileBusinesses(ctx.pbClient, input.userId)
    ),
});
