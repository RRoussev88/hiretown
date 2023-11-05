import clsx from "clsx";
import type Pocketbase from "pocketbase";
import { z } from "zod";

import type {
  APIResponse,
  BusinessService,
  Service,
  ServiceCategory,
} from "types";
import { APIError, DataCollections } from "utils";
import { procedure, businessProtectedProcedure, router } from "../trpc";

const fetchCategories = async (pbClient: Pocketbase, searchTerm?: string) => {
  try {
    const data: APIResponse<ServiceCategory> = await pbClient
      .collection(DataCollections.SERVICE_CATEGORIES)
      .getList(1, 0, {
        sort: "name",
        filter: searchTerm ? `name ~ "${searchTerm}"` : "",
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load service categories data");
  }
};

const fetchServices = async (
  pbClient: Pocketbase,
  categoryName?: string,
  searchTerm?: string,
  pagination?: { page: number; size: number }
) => {
  const filter =
    (categoryName ? `category.name="${categoryName}"` : "") +
    clsx({ "&&": !!categoryName && !!searchTerm }) +
    (searchTerm ? `name ~ "${searchTerm}"` : "");
  try {
    const data: APIResponse<Service> = await pbClient
      .collection(DataCollections.SERVICES)
      .getList(pagination?.page ?? 1, pagination?.size ?? 0, {
        sort: "category.name,name",
        filter,
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load services data");
  }
};

const updateBusinessServices = async (
  pbClient: Pocketbase,
  businessId: string,
  serviceIds: string[]
) => {
  try {
    const businessServices: BusinessService[] = await pbClient
      .collection(DataCollections.BUSINESS_SERVICES)
      .getFullList({ filter: `business="${businessId}"` });

    const businessServiceIds = businessServices.map((bs) => bs.service);

    const newServiceIds = serviceIds.filter(
      (id) => !businessServiceIds.includes(id)
    );

    const createdRecords = await Promise.all(
      newServiceIds.map((serviceId) =>
        pbClient
          .collection(DataCollections.BUSINESS_SERVICES)
          .create(
            { business: businessId, service: serviceId },
            { $autoCancel: false }
          )
      )
    );

    const deleteIds = businessServices
      .filter((bs) => !serviceIds.includes(bs.service))
      .map((bs) => bs.id);

    await Promise.all(
      deleteIds.map((bsId) =>
        pbClient
          .collection(DataCollections.BUSINESS_SERVICES)
          .delete(bsId, { $autoCancel: false })
      )
    );

    return createdRecords;
  } catch (error) {
    throw new APIError(error, "Failed to update business services");
  }
};

export const servicesRouter = router({
  serviceCategories: procedure
    .input(z.object({ searchTerm: z.string().optional() }).optional())
    .query(({ ctx, input }) =>
      fetchCategories(ctx.pbClient, input?.searchTerm)
    ),
  services: procedure
    .input(
      z.object({
        categoryName: z.string().optional(),
        searchTerm: z.string().optional(),
        pagination: z.object({ page: z.number(), size: z.number() }).optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchServices(
        ctx.pbClient,
        input.categoryName,
        input.searchTerm,
        input.pagination
      )
    ),
  updateBusinessServices: businessProtectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        serviceIds: z.array(z.string()),
      })
    )
    .mutation(({ ctx, input }) =>
      updateBusinessServices(ctx.pbClient, input.businessId, input.serviceIds)
    ),
});
