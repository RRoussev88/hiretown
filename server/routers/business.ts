import type Pocketbase from "pocketbase";
import { z } from "zod";
import type {
  APIResponse,
  BusinessArea,
  Business,
  BusinessService,
  BusinessPayload,
  OpeningHours,
  UserBusiness,
  ImageUploadPayload,
} from "types";
import {
  APIError,
  DataCollections,
  defaultResponse,
  DEFAULT_ALBUM_NAME,
  defaultOpeningHours,
} from "utils";
import {
  procedure,
  protectedProcedure,
  businessProtectedProcedure,
  router,
} from "../trpc";

const getBusiness = async (pbClient: Pocketbase, id: string) => {
  try {
    const data: Business = await pbClient
      .collection(DataCollections.BUSINESSES)
      .getOne(id, {
        expand:
          "businessServices(business).service.category," +
          "imageAlbums(business)," +
          "offers(business).unitOfMeasure," +
          "socialLinks(business).platform," +
          "businessAreas(business)",
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to find business data");
  }
};

const createBusiness = async (
  pbClient: Pocketbase,
  businessPayload: BusinessPayload & {
    openingHours?: OpeningHours;
    thumbnailFile?: ImageUploadPayload;
  }
) => {
  try {
    const business: Business = await pbClient
      .collection(DataCollections.BUSINESSES)
      .create({
        ...businessPayload,
        openingHours: {
          ...defaultOpeningHours,
          ...businessPayload.openingHours,
        },
      });

    const user = pbClient.authStore.model;

    await pbClient
      .collection(DataCollections.USER_BUSINESSES)
      .create({ user: user?.id, business: business.id });

    await pbClient
      .collection(DataCollections.IMAGE_ALBUMS)
      .create({ name: DEFAULT_ALBUM_NAME, business: business.id });

    return business;
  } catch (error) {
    throw new APIError(error, "Failed to create business");
  }
};

const userHasPermission = async (pbClient: Pocketbase, businessId: string) => {
  try {
    const user = pbClient.authStore.model;

    const permissions: UserBusiness[] = await pbClient
      .collection(DataCollections.USER_BUSINESSES)
      .getFullList(200, {
        filter: `user="${user?.id}"&&business="${businessId}"`,
      });

    return !!permissions.length;
  } catch (error) {
    throw new APIError(error, "Failed to fetch permissions");
  }
};

const updateBusiness = async (
  pbClient: Pocketbase,
  businessId: string,
  businessPayload: Partial<BusinessPayload> & {
    openingHours: Partial<OpeningHours>;
  }
) => {
  try {
    const updatedBusiness: Business = await pbClient
      .collection(DataCollections.BUSINESSES)
      .update(businessId, {
        ...businessPayload,
        openingHours: {
          ...defaultOpeningHours,
          ...businessPayload.openingHours,
        },
      });

    if (businessPayload.thumbnail) {
      const { imageBase64, imageName, imageType } = businessPayload.thumbnail;
      const base64Image = imageBase64.split(";base64,").pop();
      if (!base64Image) throw new Error("Invalid image payload");

      const buffer = Buffer.from(base64Image, "base64");
      const imageBlob = new Blob([buffer], { type: imageType });

      const formData = new FormData();
      formData.append("thumbnail", imageBlob, imageName);

      return await pbClient
        .collection(DataCollections.BUSINESSES)
        .update(businessId, formData, { $autoCancel: false });
    }

    return updatedBusiness;
  } catch (error) {
    throw new APIError(error, "Failed to update business");
  }
};

const deleteBusiness = async (pbClient: Pocketbase, id: string) => {
  try {
    const data = await pbClient
      .collection(DataCollections.BUSINESSES)
      .delete(id);

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to delete business");
  }
};

const fetchBusinesses = async (
  pbClient: Pocketbase,
  serviceName: string,
  countryName: string,
  cityName?: string,
  regionName?: string,
  divisionName?: string,
  searchTerm?: string,
  page = 1
): Promise<APIResponse<Business>> => {
  if (
    !serviceName ||
    serviceName === "undefined" ||
    !countryName ||
    countryName === "undefined"
  ) {
    return defaultResponse;
  }

  try {
    const countryAreas: BusinessArea[] = await pbClient
      .collection(DataCollections.BUSINESS_AREAS)
      .getFullList(200, {
        filter: `country.name="${countryName}"&&region.id=""&&division.id=""&&city.id=""`,
      });
    const regionAreas: BusinessArea[] = regionName
      ? await pbClient
          .collection(DataCollections.BUSINESS_AREAS)
          .getFullList(200, {
            filter: `country.name="${countryName}"
            &&region.name="${regionName}"
            &&division.id=""&&city.id=""`,
          })
      : [];
    const divisionAreas: BusinessArea[] =
      regionName && divisionName
        ? await pbClient
            .collection(DataCollections.BUSINESS_AREAS)
            .getFullList(200, {
              filter: `country.name="${countryName}"
              &&region.name="${regionName}"
              &&division.name="${divisionName}"
              &&city.id=""`,
            })
        : [];
    const cityAreas: BusinessArea[] = cityName
      ? await pbClient
          .collection(DataCollections.BUSINESS_AREAS)
          .getFullList(200, {
            filter: `country.name="${countryName}"&&city.name="${cityName}"`,
          })
      : [];

    const bsFilter = countryAreas
      .concat(regionAreas)
      .concat(divisionAreas)
      .concat(cityAreas)
      .map((area) => `business.id='${area.business}'`)
      .join("||");

    if (!bsFilter.length) {
      return defaultResponse;
    }

    const mappingData: APIResponse<BusinessService> = await pbClient
      .collection(DataCollections.BUSINESS_SERVICES)
      .getList(page, 20, {
        filter:
          `service.name="${serviceName}"&&(${bsFilter})` +
          (searchTerm ? `&&business.name ~ "${searchTerm}"` : ""),
      });

    if (!mappingData.items.length) {
      return defaultResponse;
    }
    const businessFilter = mappingData.items
      .map((bs) => `id='${bs.business}'`)
      .join("||");

    const data: APIResponse<Business> = await pbClient
      .collection(DataCollections.BUSINESSES)
      .getList(page, 20, {
        sort: "name",
        filter: businessFilter,
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load businesses data");
  }
};

export const businessRouter = router({
  businesses: procedure
    .input(
      z.object({
        service: z.string(),
        country: z.string(),
        region: z.string().optional(),
        division: z.string().optional(),
        city: z.string().optional(),
        searchTerm: z.string().optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchBusinesses(
        ctx.pbClient,
        input.service,
        input.country,
        input.city,
        input.region,
        input.division,
        input.searchTerm,
        input.page
      )
    ),
  business: procedure
    .input(z.string())
    .query(({ ctx, input }) => getBusiness(ctx.pbClient, input)),
  createBusiness: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        address: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactWebsite: z.string().optional(),
        isActive: z.boolean(),
        priority: z.number().min(1),
        rating: z.number().min(1).max(5),
        openingHours: z
          .object({
            Monday: z.tuple([z.string(), z.string()]),
            Tuesday: z.tuple([z.string(), z.string()]),
            Wednesday: z.tuple([z.string(), z.string()]),
            Thursday: z.tuple([z.string(), z.string()]),
            Friday: z.tuple([z.string(), z.string()]),
            Saturday: z.tuple([z.string(), z.string()]),
            Sunday: z.tuple([z.string(), z.string()]),
          })
          .optional(),
        thumbnailFile: z
          .object({
            imageBase64: z.string(),
            imageName: z.string(),
            imageType: z.string(),
          })
          .optional(),
      })
    )
    .mutation(({ ctx, input }) => createBusiness(ctx.pbClient, input)),
  updateBusiness: businessProtectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactWebsite: z.string().optional(),
        isActive: z.boolean().optional(),
        priority: z.number().min(1).optional(),
        rating: z.number().min(1).max(5).optional(),
        openingHours: z
          .object({
            Monday: z.tuple([z.string(), z.string()]),
            Tuesday: z.tuple([z.string(), z.string()]),
            Wednesday: z.tuple([z.string(), z.string()]),
            Thursday: z.tuple([z.string(), z.string()]),
            Friday: z.tuple([z.string(), z.string()]),
            Saturday: z.tuple([z.string(), z.string()]),
            Sunday: z.tuple([z.string(), z.string()]),
          })
          .or(z.object({})),
        thumbnail: z
          .object({
            imageBase64: z.string(),
            imageName: z.string(),
            imageType: z.string(),
          })
          .optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      updateBusiness(ctx.pbClient, input.businessId, input)
    ),
  deleteBusiness: businessProtectedProcedure
    .input(z.object({ businessId: z.string() }))
    .mutation(({ ctx, input }) =>
      deleteBusiness(ctx.pbClient, input.businessId)
    ),
  hasPermission: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => userHasPermission(ctx.pbClient, input)),
});
