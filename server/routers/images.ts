import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { APIResponse, ImageUploadPayload, BusinessImage } from "types";
import { APIError, DataCollections, defaultResponse } from "utils";
import {
  businessProtectedProcedure,
  protectedProcedure,
  router,
} from "../trpc";

const fetchImages = async (pbClient: Pocketbase, albumId?: string) => {
  if (!albumId) {
    return defaultResponse;
  }
  try {
    const data: APIResponse<BusinessImage> = await pbClient
      .collection(DataCollections.BUSINESS_IMAGES)
      .getList(1, 20, {
        sort: "-isSelected,image",
        filter: `album="${albumId}"`,
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load images data");
  }
};

const fetchBusinessImages = async (
  pbClient: Pocketbase,
  businessId?: string
) => {
  if (!businessId) {
    return defaultResponse;
  }
  try {
    const data: APIResponse<BusinessImage> = await pbClient
      .collection(DataCollections.BUSINESS_IMAGES)
      .getList(1, 20, {
        sort: "-isSelected,-created",
        filter: `album.business="${businessId}"`,
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load business images data");
  }
};

const updateBusinessImages = async (
  pbClient: Pocketbase,
  businessId: string,
  albumId: string,
  imagePayloads: ImageUploadPayload[],
  deleteImages: string[]
) => {
  // `businessId` is passed for `businessProtectedProcedure` guard to work
  if (!businessId) {
    return defaultResponse;
  }
  try {
    const deleted = await Promise.all(
      deleteImages?.map((id) =>
        pbClient
          .collection(DataCollections.BUSINESS_IMAGES)
          .delete(id, { albumId, $autoCancel: false })
      ) ?? []
    );

    const created = await Promise.all(
      imagePayloads.map((image) => {
        const base64Image = image.imageBase64.split(";base64,").pop();
        if (!base64Image) throw new Error("Invalid image payload");

        const buffer = Buffer.from(base64Image, "base64");
        const imageBlob = new Blob([buffer], { type: image.imageType });

        const formData = new FormData();
        formData.append("album", albumId);
        formData.append("isSelected", "false");
        formData.append("image", imageBlob, image.imageName);

        return pbClient
          .collection(DataCollections.BUSINESS_IMAGES)
          .create(formData, { $autoCancel: false });
      })
    );

    return { deleted: deleted.length, created: created.length };
  } catch (error) {
    throw new APIError(error, "Failed to create images");
  }
};

export const imagesRouter = router({
  images: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => fetchImages(ctx.pbClient, input)),
  businessImages: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => fetchBusinessImages(ctx.pbClient, input)),
  updateBusinessImages: businessProtectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        albumId: z.string(),
        imagePayloads: z.array(
          z.object({
            imageBase64: z.string(),
            imageName: z.string(),
            imageType: z.string(),
          })
        ),
        deleteImages: z.array(z.string()),
      })
    )
    .mutation(({ ctx, input }) =>
      updateBusinessImages(
        ctx.pbClient,
        input.businessId,
        input.albumId,
        input.imagePayloads,
        input.deleteImages
      )
    ),
});
