import type Pocketbase from "pocketbase";
import { z } from "zod";

import type { APIResponse, Project, ProjectService } from "types";
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
        expand:
          "country,region,division,city," +
          "projectServices(project).service.category",
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
  cityName?: string,
  serviceName?: string
) => {
  try {
    let bsFilter = "";
    if (!!serviceName) {
      const serviceFilter =
        `project.isFinished="true"` +
        `&&project.country.name=${countryName}` +
        `&&project.region.name=${regionName}` +
        (divisionName ? `&&project.division.name=${divisionName}` : "") +
        (cityName ? `&&project.city.name=${cityName}` : "") +
        (serviceName ? `&&service.name="${serviceName}"` : "");

      const projectServices: ProjectService[] = await pbClient
        .collection(DataCollections.PROJECT_SERVICES)
        .getFullList(200, { filter: serviceFilter });

      bsFilter = projectServices
        .map((projectService) => `id='${projectService.project}'`)
        .join("||");
    }

    const filter =
      `isFinished="true"` +
      `&&country.name="${countryName}"` +
      `&&region.name="${regionName}"` +
      (divisionName ? `&&division.name="${divisionName}"` : "") +
      (cityName ? `&&city.name="${cityName}"` : "") +
      (bsFilter ? `&&(${bsFilter})` : "");

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

const userHasProjectPermission = async (
  pbClient: Pocketbase,
  projectId: string
) => {
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

const createProjectService = async (
  pbClient: Pocketbase,
  projectId: string,
  serviceId: string,
  description: string,
  targetDate?: Date,
  maxPrice?: number,
  isFinished?: boolean
) => {
  const defaultErrorMessage = "Failed to create a project service record";
  if (!projectId) {
    throw new APIError(
      '"projectId" parameter is required',
      defaultErrorMessage
    );
  }

  try {
    const data: ProjectService = await pbClient
      .collection(DataCollections.PROJECT_SERVICES)
      .create({
        project: projectId,
        service: serviceId,
        description,
        targetDate,
        maxPrice,
        isFinished,
      });

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

const updateProjectService = async (
  pbClient: Pocketbase,
  projectId: string,
  projectServiceId: string,
  projectServicePayload: Partial<ProjectService>
) => {
  const defaultErrorMessage = "Failed to update a project service record";
  if (!projectId || !projectServiceId) {
    throw new APIError(
      '"projectId" and "projectServiceId" parameters are required',
      defaultErrorMessage
    );
  }

  try {
    const updatedProject: ProjectService = await pbClient
      .collection(DataCollections.PROJECT_SERVICES)
      .update(projectServiceId, { ...projectServicePayload });

    return updatedProject;
  } catch (error) {
    throw new APIError(error, "Failed to update project");
  }
};

const deleteProjectService = async (
  pbClient: Pocketbase,
  projectId: string,
  projectServiceId: string
) => {
  const defaultErrorMessage = "Failed to delete project service record";
  if (!projectId || !projectServiceId) {
    throw new APIError(
      '"projectId" and "projectServiceId" parameters are required',
      defaultErrorMessage
    );
  }

  try {
    const data = await pbClient
      .collection(DataCollections.PROJECT_SERVICES)
      .delete(projectServiceId);

    return data;
  } catch (error) {
    throw new APIError(error, defaultErrorMessage);
  }
};

const transformToDate = (dateString: string) => {
  const date = new Date(dateString);
  return date;
};

const setLastSecondToDate = (date: Date) => {
  date.setHours(23, 59, 59, 999);
  return date;
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
        serviceName: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      fetchProjects(
        ctx.pbClient,
        input.countryName,
        input.regionName,
        input.divisionName,
        input.cityName,
        input.serviceName,
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
        city: z.string().optional(),
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
  createProjectService: projectProtectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        serviceId: z.string(),
        description: z.string().trim(),
        targetDate: z.date().transform(setLastSecondToDate).optional(),
        maxPrice: z.onumber(),
        isFinished: z.oboolean(),
      })
    )
    .mutation(({ ctx, input }) =>
      createProjectService(
        ctx.pbClient,
        input.projectId,
        input.serviceId,
        input.description,
        input.targetDate,
        input.maxPrice,
        input.isFinished
      )
    ),
  updateProjectService: projectProtectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        projectServiceId: z.string(),
        projectServicePayload: z
          .object({
            service: z.ostring(),
            description: z.string().trim().optional(),
            targetDate: z
              .date()
              .or(z.string().transform(transformToDate))
              .transform(setLastSecondToDate),
            maxPrice: z.number(),
            isFinished: z.boolean(),
          })
          .partial(),
      })
    )
    .mutation(({ ctx, input }) =>
      updateProjectService(
        ctx.pbClient,
        input.projectId,
        input.projectServiceId,
        input.projectServicePayload
      )
    ),
  deleteProjectService: projectProtectedProcedure
    .input(z.object({ projectId: z.string(), projectServiceId: z.string() }))
    .mutation(({ ctx, input }) =>
      deleteProjectService(
        ctx.pbClient,
        input.projectId,
        input.projectServiceId
      )
    ),
});
