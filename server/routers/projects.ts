import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { APIResponse, Project } from "types";
import { APIError, DataCollections, defaultResponse } from "utils";
import {
  procedure,
  protectedProcedure,
  projectProtectedProcedure,
  router,
} from "../trpc";

const getProject = async (pbClient: Pocketbase, id: string) => {
  try {
    const data: Project = await pbClient
      .collection(DataCollections.PROJECTS)
      .getOne(id, {
        expand: "country,region,division,city",
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to find project data");
  }
};

const fetchUserProjects = async (pbClient: Pocketbase) => {
  const userId = pbClient.authStore.model?.id;
  if (!userId) {
    return defaultResponse;
  }
  try {
    const data: APIResponse<Project> = await pbClient
      .collection(DataCollections.PROJECTS)
      .getList(1, 20, {
        sort: "-created",
        filter: `user="${userId}"`,
        expand: "country,region,division,city",
      });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load projects data");
  }
};

const fetchProjects = async (
  pbClient: Pocketbase,
  countryName: string,
  regionName: string,
  divisionName?: string,
  cityName?: string
) => {
  const filter =
    `isFinished="true"` +
    (cityName ? `&&city.name="${cityName}"` : "") +
    (divisionName ? `&&division.name="${divisionName}"` : "") +
    `&&region.name="${regionName}"&&country.name="${countryName}"`;
  // TODO: Add filter by services
  try {
    const data: APIResponse<Project> = await pbClient
      .collection(DataCollections.PROJECTS)
      .getList(1, 20, { sort: "-created", filter });

    return data;
  } catch (error) {
    throw new APIError(error, "Failed to load projects data");
  }
};

const createProject = async (
  pbClient: Pocketbase,
  name: string,
  country: string,
  region: string,
  division?: string,
  city?: string,
  description?: string
) => {
  const defaultErrorMessage = "Failed to create a project record";
  const userId = pbClient.authStore.model?.id;
  if (!userId || !country) {
    throw new APIError(
      '"userId", "name", "country", "region" and "city" parameters are required',
      defaultErrorMessage
    );
  }
  try {
    const data: Project = await pbClient
      .collection(DataCollections.PROJECTS)
      .create({
        user: userId,
        name,
        country,
        region,
        division,
        city,
        description,
      });

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

const updateProject = async (
  pbClient: Pocketbase,
  projectId: string,
  projectPayload: Partial<Project>
) => {
  try {
    const updatedProject: Project = await pbClient
      .collection(DataCollections.PROJECTS)
      .update(projectId, { ...projectPayload });

    return updatedProject;
  } catch (error) {
    throw new APIError(error, "Failed to update project");
  }
};

const deleteProject = async (pbClient: Pocketbase, projectId: string) => {
  const defaultErrorMessage = "Failed to delete project record";
  const userId = pbClient.authStore.model?.id;
  if (!userId || !projectId) {
    throw new APIError(
      '"userId" and "projectId" parameters are required',
      defaultErrorMessage
    );
  }
  try {
    const data = await pbClient
      .collection(DataCollections.PROJECTS)
      .delete(projectId, { filter: `user="${userId}"` });

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

const userHasProjectPermission = async (pbClient: Pocketbase, projectId: string) => {
  try {
    const user = pbClient.authStore.model;

    const permissions: Project[] = await pbClient
      .collection(DataCollections.PROJECTS)
      .getFullList(200, {
        filter: `user="${user?.id}"&&id="${projectId}"`,
      });

    return !!permissions.length;
  } catch (error) {
    throw new APIError(error, "Failed to fetch permissions");
  }
};

export const projectsRouter = router({
  project: procedure
    .input(z.string())
    .query(({ ctx, input }) => getProject(ctx.pbClient, input)),
  userProjects: protectedProcedure.query(({ ctx }) =>
    fetchUserProjects(ctx.pbClient)
  ),
  projects: procedure
    .input(
      z.object({
        countryName: z.string(),
        regionName: z.string(),
        divisionName: z.string().optional(),
        cityName: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchProjects(
        ctx.pbClient,
        input.countryName,
        input.regionName,
        input.divisionName,
        input.cityName
      )
    ),
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        country: z.string(),
        region: z.string(),
        division: z.string().optional(),
        city: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createProject(
        ctx.pbClient,
        input.name,
        input.country,
        input.region,
        input.division,
        input.city,
        input.description
      )
    ),
  updateProject: projectProtectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        isFinished: z.boolean().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        division: z.string().optional(),
        cityId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      updateProject(ctx.pbClient, input.projectId, input)
    ),
  deleteProject: projectProtectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(({ ctx, input }) => deleteProject(ctx.pbClient, input.projectId)),
  hasProjectPermission: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => userHasProjectPermission(ctx.pbClient, input)),
});
