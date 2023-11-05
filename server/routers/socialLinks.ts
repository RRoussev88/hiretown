import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { SocialLink, SocialPlatform } from "types";
import { APIError, DataCollections } from "utils";
import { businessProtectedProcedure, procedure, router } from "../trpc";

const fetchPlatforms = async (
  pbClient: Pocketbase
): Promise<SocialPlatform[]> => {
  try {
    const platforms: SocialPlatform[] = await pbClient
      .collection(DataCollections.SOCIAL_PLATFORMS)
      .getFullList({ sort: "title" });

    return platforms;
  } catch (error) {
    throw new APIError(error, "Failed to fetch platforms");
  }
};

const createLink = async (
  pbClient: Pocketbase,
  linkPayload: Omit<SocialLink, "expand">
) => {
  try {
    const link: SocialLink = await pbClient
      .collection(DataCollections.SOCIAL_LINKS)
      .create({
        business: linkPayload.businessId,
        link: linkPayload.link,
        platform: linkPayload.platformId,
        title: linkPayload.title,
      });

    return link;
  } catch (error) {
    throw new APIError(error, "Failed to create a link");
  }
};

const deleteLink = async (
  pbClient: Pocketbase,
  businessId: string,
  linkId: string
) => {
  // `businessId` is passed for `businessProtectedProcedure` guard to work
  if (!businessId) {
    return false;
  }
  try {
    const isDeleted = await pbClient
      .collection(DataCollections.SOCIAL_LINKS)
      .delete(linkId);

    return isDeleted;
  } catch (error) {
    throw new APIError(error, "Failed to delete a link");
  }
};

export const socialLinksRouter = router({
  platforms: procedure
    .input(z.number().optional())
    .query(({ ctx }) => fetchPlatforms(ctx.pbClient)),
  createLink: businessProtectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        link: z.string(),
        platformId: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => createLink(ctx.pbClient, input)),
  deleteLink: businessProtectedProcedure
    .input(z.object({ businessId: z.string(), linkId: z.string() }))
    .mutation(({ ctx, input }) =>
      deleteLink(ctx.pbClient, input.businessId, input.linkId)
    ),
});
