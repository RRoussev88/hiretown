import clsx from "clsx";
import type Pocketbase from "pocketbase";
import { z } from "zod";

import type {
  BaseRecord,
  BusinessArea,
  City,
  Country,
  Division,
  Region,
} from "types";
import { APIError, DataCollections } from "utils";
import { businessProtectedProcedure, procedure, router } from "../trpc";

const countryIds = {
  Canada: "Q16",
  Norway: "Q20",
  Ireland: "Q27",
  Hungary: "Q28",
  Spain: "Q29",
  USA: "Q30",
  Belgium: "Q31",
  Luxembourg: "Q32",
  Finland: "Q33",
  Sweden: "Q34",
  Denmark: "Q35",
  Poland: "Q36",
  Lithuania: "Q37",
  Italy: "Q38",
  Switzerland: "Q39",
  Austria: "Q40",
  Greece: "Q41",
  Turkey: "Q43",
  Portugal: "Q45",
  Netherlands: "Q55",
  France: "Q142",
  UK: "Q145",
  Russia: "Q159",
  Germany: "Q183",
  Belarus: "Q184",
  Iceland: "Q189",
  Estonia: "Q191",
  Latvia: "Q211",
  Ukraine: "Q212",
  Czechia: "Q213",
  Slovakia: "Q214",
  Slovenia: "Q215",
  Moldova: "Q217",
  Romania: "Q218",
  Bulgaria: "Q219",
  MK: "Q221",
  Albania: "Q222",
  Croatia: "Q224",
  BA: "Q225",
  Azerbaijan: "Q227",
  Andorra: "Q228",
  Cyprus: "Q229",
  Georgia: "Q230",
  Malta: "Q233",
  Monaco: "Q235",
  Montenegro: "Q236",
  SM: "Q238",
  Liechtenstein: "Q347",
  Armenia: "Q399",
  Serbia: "Q403",
  Australia: "Q408",
  NZ: "Q664",
};

const getRecordById = async <T = BaseRecord>(
  pbClient: Pocketbase,
  collection: string,
  id: string
) => {
  if (!id) {
    return null;
  }
  try {
    const data: T = await pbClient.collection(collection).getOne<T>(id);

    return data;
  } catch (error) {
    throw new APIError(error, `Failed to load ${collection} data`);
  }
};

const fetchCountries = async (pbClient: Pocketbase, searchTerm?: string) => {
  try {
    const data: Country[] = await pbClient
      .collection(DataCollections.COUNTRIES)
      .getFullList(200, {
        sort: "name",
        filter: searchTerm ? `name ~ "${searchTerm}"` : "",
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load countries data");
  }
};

const fetchRegions = async (
  pbClient: Pocketbase,
  countryName?: string,
  searchTerm?: string
) => {
  if (!countryName) {
    return [];
  }

  try {
    const data: Region[] = await pbClient
      .collection(DataCollections.REGIONS)
      .getFullList(200, {
        sort: "name",
        filter:
          `country.name="${countryName}"` +
          (searchTerm ? `&&name ~ "${searchTerm}"` : ""),
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load regions data");
  }
};

const fetchDivisions = async (
  pbClient: Pocketbase,
  countryName?: string,
  regionName?: string,
  searchTerm?: string
) => {
  if (!countryName || !regionName) {
    return [];
  }

  const filter =
    `country.name="${countryName}"&&region.name="${regionName}"` +
    (searchTerm ? `&&name ~ "${searchTerm}"` : "");

  try {
    const data: Division[] = await pbClient
      .collection(DataCollections.DIVISIONS)
      .getFullList(200, { sort: "name", filter });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load divisions data");
  }
};

const fetchCities = async (
  pbClient: Pocketbase,
  countryName?: string,
  regionName?: string,
  divisionName?: string,
  searchTerm?: string
) => {
  if (!countryName) {
    return [];
  }

  const filter =
    (divisionName ? `division.name="${divisionName}"` : "") +
    clsx({ "&&": !!divisionName && !!regionName }) +
    (regionName ? `region.name="${regionName}"` : "") +
    clsx({ "&&": !!regionName }) +
    `country.name="${countryName}"` +
    (searchTerm ? `&&name ~ "${searchTerm}"` : "");

  try {
    const data: City[] = await pbClient
      .collection(DataCollections.CITIES)
      .getFullList(200, { sort: searchTerm ? "name" : "-population", filter });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load cities data");
  }
};

const fetchBusinessAreas = async (pbClient: Pocketbase, businessId: string) => {
  try {
    const data: BusinessArea[] = await pbClient
      .collection(DataCollections.AREAS)
      .getFullList(200, {
        filter: `business="${businessId}"`,
        expand: "country,region,division,city",
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to fetch business areas");
  }
};

const createBusinessArea = async (
  pbClient: Pocketbase,
  businessId: string,
  countryId: string,
  regionId?: string,
  divisionId?: string,
  cityId?: string
) => {
  try {
    const currentAreas: BusinessArea[] = await pbClient
      .collection(DataCollections.AREAS)
      .getFullList(200, {
        filter:
          `business="${businessId}"&&country="${countryId}"` +
          (!!regionId ? `&&region="${regionId}"` : "") +
          (!!divisionId ? `&&division="${divisionId}"` : "") +
          (!!cityId ? `&&city="${cityId}"` : ""),
      });

    if (currentAreas.length) {
      throw new APIError(
        "This business already has an area with the selected parameters"
      );
    }

    const createdArea = await pbClient
      .collection(DataCollections.AREAS)
      .create({
        business: businessId,
        country: countryId,
        region: regionId,
        division: divisionId,
        city: cityId,
      });

    return createdArea;
  } catch (error) {
    throw new APIError(error, "Failed to create business area");
  }
};

const deleteBusinessArea = async (
  pbClient: Pocketbase,
  businessId: string,
  areaId: string
) => {
  try {
    const createdArea = await pbClient
      .collection(DataCollections.AREAS)
      .delete(areaId, { filter: `business="${businessId}"` });

    return createdArea;
  } catch (error) {
    throw new APIError(error, "Failed to delete business area");
  }
};

export const locationsRouter = router({
  getRecord: procedure
    .input(z.object({ collection: z.string(), id: z.string() }))
    .query(({ ctx, input }) =>
      getRecordById(ctx.pbClient, input.collection, input.id)
    ),
  countries: procedure
    .input(z.object({ searchTerm: z.string().optional() }))
    .query(({ ctx, input }) => fetchCountries(ctx.pbClient, input.searchTerm)),
  regions: procedure
    .input(
      z.object({
        countryName: z.string().optional(),
        searchTerm: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchRegions(ctx.pbClient, input.countryName, input.searchTerm)
    ),
  divisions: procedure
    .input(
      z.object({
        countryName: z.string().optional(),
        regionName: z.string().optional(),
        searchTerm: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchDivisions(
        ctx.pbClient,
        input.countryName,
        input.regionName,
        input.searchTerm
      )
    ),
  cities: procedure
    .input(
      z.object({
        countryName: z.string().optional(),
        regionName: z.string().optional(),
        divisionName: z.string().optional(),
        searchTerm: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchCities(
        ctx.pbClient,
        input.countryName,
        input.regionName,
        input.divisionName,
        input.searchTerm
      )
    ),
  createBusinessArea: businessProtectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        countryId: z.string(),
        regionId: z.string().optional(),
        divisionId: z.string().optional(),
        cityId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createBusinessArea(
        ctx.pbClient,
        input.businessId,
        input.countryId,
        input.regionId,
        input.divisionId,
        input.cityId
      )
    ),
  businessAreas: procedure
    .input(z.object({ businessId: z.string() }))
    .query(({ ctx, input }) =>
      fetchBusinessAreas(ctx.pbClient, input.businessId)
    ),
  deleteBusinessArea: businessProtectedProcedure
    .input(z.object({ businessId: z.string(), areaId: z.string() }))
    .mutation(({ ctx, input }) =>
      deleteBusinessArea(ctx.pbClient, input.businessId, input.areaId)
    ),
});
