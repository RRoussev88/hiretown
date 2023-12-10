import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { APIResponse, BusinessSearch } from "types";
import { APIError, DataCollections, defaultResponse } from "utils";
import { protectedProcedure, router } from "../trpc";

const fetchBusinessSearches = async (pbClient: Pocketbase) => {
  const userId = pbClient.authStore.model?.id;
  if (!userId) {
    return defaultResponse;
  }
  try {
    const data: APIResponse<BusinessSearch> = await pbClient
      .collection(DataCollections.BUSINESS_SEARCHES)
      .getList(1, 20, {
        sort: "-created",
        filter: `user="${userId}"`,
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load business searches data");
  }
};

const createBusinessSearch = async (
  pbClient: Pocketbase,
  serviceName: string,
  countryName: string,
  regionName?: string,
  divisionName?: string,
  cityName?: string
) => {
  const defaultErrorMessage = "Failed to create a business search record";
  const userId = pbClient.authStore.model?.id;
  if (!userId || !countryName) {
    throw new APIError(
      '"userId", "serviceName" and "countryName" parameters are required',
      defaultErrorMessage
    );
  }
  try {
    const data: BusinessSearch = await pbClient
      .collection(DataCollections.BUSINESS_SEARCHES)
      .create({
        user: userId,
        serviceName,
        countryName,
        regionName,
        divisionName,
        cityName,
      });

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

const deleteBusinessSearch = async (pbClient: Pocketbase, searchId: string) => {
  const defaultErrorMessage = "Failed to delete business search record";
  const userId = pbClient.authStore.model?.id;
  if (!userId || !searchId) {
    throw new APIError(
      '"userId" and "searchId" parameters are required',
      defaultErrorMessage
    );
  }
  try {
    const data = await pbClient
      .collection(DataCollections.BUSINESS_SEARCHES)
      .delete(searchId, { filter: `user="${userId}"` });

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

export const searchesRouter = router({
  businessSearches: protectedProcedure.query(({ ctx }) =>
    fetchBusinessSearches(ctx.pbClient)
  ),
  createBusinessSearch: protectedProcedure
    .input(
      z.object({
        serviceName: z.string(),
        countryName: z.string(),
        regionName: z.string().optional(),
        divisionName: z.string().optional(),
        cityName: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createBusinessSearch(
        ctx.pbClient,
        input.serviceName,
        input.countryName,
        input.regionName,
        input.divisionName,
        input.cityName
      )
    ),
  deleteBusinessSearch: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => deleteBusinessSearch(ctx.pbClient, input)),
});
