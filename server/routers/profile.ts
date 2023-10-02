import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { APIResponse, UserBusiness } from "../../types";
import { APIError, DataCollections } from "../../utils";
import { protectedProcedure, router } from "../trpc";

const fetchProfileBusinesses = async (
  pbClient: Pocketbase,
  userId: string,
  page = 1
): Promise<APIResponse<UserBusiness>> => {
  try {
    const userBusinesses: APIResponse<UserBusiness> = await pbClient
      .collection(DataCollections.USER_BUSINESSES)
      .getList(page, 20, {
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
      fetchProfileBusinesses(ctx.pbClient, input.userId, input.page)
    ),
});
