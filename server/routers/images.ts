import type Pocketbase from "pocketbase";
import { z } from "zod";

import type {
  APIResponse,
  BusinessImage,
  ImageAlbum,
  ImageUploadPayload,
} from "types";
import { APIError, DataCollections, defaultResponse } from "utils";
import { businessProtectedProcedure, procedure, router } from "../trpc";

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

const updateAlbumImages = async (
  pbClient: Pocketbase,
  businessId: string,
  albumId: string,
  imagePayloads: ImageUploadPayload[],
  deleteImages: string[]
) => {
  // `businessId` is passed for `businessProtectedProcedure` guard to work
  const defaultErrorMessage = "Failed to load images data";
  if (!businessId) {
    throw new APIError(
      '"businessId" parameter is required',
      defaultErrorMessage
    );
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
    throw new APIError(error, defaultErrorMessage);
  }
};

const fetchBusinessAlbums = async (
  pbClient: Pocketbase,
  businessId?: string
) => {
  if (!businessId) {
    return defaultResponse;
  }
  try {
    const data: APIResponse<ImageAlbum[]> = await pbClient
      .collection(DataCollections.IMAGE_ALBUMS)
      .getList(1, 20, {
        sort: "created",
        filter: `business="${businessId}"`,
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load albums data");
  }
};

const createImageAlbum = async (
  pbClient: Pocketbase,
  businessId: string,
  albumName: string,
  albumDescription?: string
) => {
  const defaultErrorMessage = "Failed to create image album";
  if (!businessId || !albumName) {
    throw new APIError(
      '"businessId" and "albumName" parameters are required',
      defaultErrorMessage
    );
  }
  try {
    const data: BusinessImage = await pbClient
      .collection(DataCollections.IMAGE_ALBUMS)
      .create({
        business: businessId,
        name: albumName,
        description: albumDescription,
      });

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

const deleteImageAlbum = async (
  pbClient: Pocketbase,
  businessId: string,
  albumId: string
) => {
  const defaultErrorMessage = "Failed to delete image album";
  if (!businessId || !albumId) {
    throw new APIError(
      '"businessId" and "albumId" parameters are required',
      defaultErrorMessage
    );
  }
  try {
    const data = await pbClient
      .collection(DataCollections.IMAGE_ALBUMS)
      .delete(albumId);

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

export const imagesRouter = router({
  images: procedure
    .input(z.string())
    .query(({ ctx, input }) => fetchImages(ctx.pbClient, input)),
  businessImages: procedure
    .input(z.string())
    .query(({ ctx, input }) => fetchBusinessImages(ctx.pbClient, input)),
  updateAlbumImages: businessProtectedProcedure
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
      updateAlbumImages(
        ctx.pbClient,
        input.businessId,
        input.albumId,
        input.imagePayloads,
        input.deleteImages
      )
    ),
  imageAlbums: procedure
    .input(z.string())
    .query(({ ctx, input }) => fetchBusinessAlbums(ctx.pbClient, input)),
  createImageAlbum: businessProtectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        albumName: z.string(),
        albumDescription: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createImageAlbum(
        ctx.pbClient,
        input.businessId,
        input.albumName,
        input.albumDescription
      )
    ),
  deleteImageAlbum: businessProtectedProcedure
    .input(z.object({ businessId: z.string(), albumId: z.string() }))
    .mutation(({ ctx, input }) =>
      deleteImageAlbum(ctx.pbClient, input.businessId, input.albumId)
    ),
});
