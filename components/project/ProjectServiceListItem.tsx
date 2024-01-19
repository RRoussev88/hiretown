"use client";
import { List } from "antd";
import type { FC } from "react";
import { ProjectService } from "types";
import { PopConfirmDelete } from "..";
import { trpc } from "trpc";
import { useErrorToaster } from "hooks";

type ProjectServiceListItemProps = {
  projectService: ProjectService;
  onSuccess?: () => void;
};

export const ProjectServiceListItem: FC<ProjectServiceListItemProps> = ({
  projectService,
  onSuccess,
}) => {
  const {
    mutate: deleteProjectService,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.deleteProjectService.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error deleting project service"
  );

  return (
    <List.Item
      actions={[
        <PopConfirmDelete
          key={`del-${projectService.id}`}
          title="Delete service"
          description="Are you sure to delete this service?"
          isLoading={isLoading}
          onDelete={() =>
            deleteProjectService({
              projectId: projectService.project,
              projectServiceId: projectService.id,
            })
          }
        />,
      ]}
    >
      {contextHolder}
      <List.Item.Meta
        title={
          <span className="font-bold">
            {projectService.expand?.service.name}
          </span>
        }
        description={projectService.description}
      />
      {(!!projectService.targetDate || !!projectService.maxPrice) && (
        <div className="flex flex-col gap-2">
          {!!projectService.maxPrice && (
            <div>
              <span className="font-semibold">Maximum cost:</span>
              &nbsp;&euro;&nbsp;{projectService.maxPrice}
            </div>
          )}
          {!!projectService.targetDate && (
            <div>
              <span className="font-semibold">Deadline:</span>&nbsp;
              {new Date(projectService.targetDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </List.Item>
  );
};
