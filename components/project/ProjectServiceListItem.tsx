"use client";
import { Button, DatePicker, Input, List, Space } from "antd";
import dayjs from "dayjs";
import { type FC, useState, useCallback, useMemo } from "react";

import { LocationSelectState, ProjectService } from "types";
import { PopConfirmDelete, ServicesCategoriesSelect } from "..";
import { Cancel, Edit, Save } from "components";
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
  const [isEditing, setIsEditing] = useState(false);
  const [projectState, setProjectState] = useState(projectService);

  const {
    mutate: updateProjectService,
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    isSuccess: isSuccessUpdate,
    error: errorUpdate,
  } = trpc.updateProjectService.useMutation({
    onSuccess: () => {
      onSuccess?.();
      handleCancelClick();
    },
  });

  const {
    mutate: deleteProjectService,
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    isSuccess: isSuccessDelete,
    error: errorDelete,
  } = trpc.deleteProjectService.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isErrorDelete || isErrorUpdate,
    isSuccessDelete || isSuccessUpdate,
    (errorDelete ?? errorUpdate)?.message ?? "Error deleting project service"
  );

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    setProjectState(projectService);
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProjectService({
      projectId: projectService.project,
      projectServiceId: projectService.id,
      projectServicePayload: projectState,
    });
  };

  const handleDelete = () =>
    deleteProjectService({
      projectId: projectService.project,
      projectServiceId: projectService.id,
    });

  const setSelectedService = useCallback(
    (type: "category" | "service", obj: LocationSelectState) => {
      if (type === "service") {
        setProjectState((prevState) => ({
          ...prevState,
          service: obj?.id ?? "",
        }));
      }
    },
    [setProjectState]
  );

  const isLoadingProjectService = isLoadingDelete || isLoadingUpdate;

  const servicesCategoriesState = useMemo(
    () => ({
      category: { isLoading: false },
      service: { id: projectService.service, isLoading: false },
    }),
    [projectService.service]
  );

  return (
    <List.Item
      actions={[
        <Space.Compact
          key={`btns-${projectService.id}`}
          size="large"
          className="hidden sm:inline-flex"
        >
          {isEditing ? (
            <>
              <Button
                tabIndex={0}
                type="default"
                className="bg-primary"
                onClick={handleCancelClick}
                loading={isLoadingProjectService}
                icon={<Cancel />}
              />
              <Button
                tabIndex={0}
                type="default"
                className="bg-primary"
                onClick={handleSave}
                loading={isLoadingProjectService}
                icon={<Save />}
              />
            </>
          ) : (
            <>
              <Button
                key={`edit-${projectService.id}`}
                tabIndex={0}
                type="default"
                className="bg-primary"
                onClick={handleEditClick}
                loading={isLoadingProjectService}
                icon={<Edit />}
              />
              <PopConfirmDelete
                key={`del-${projectService.id}`}
                title="Delete service"
                description="Are you sure to delete this service?"
                isLoading={isLoadingProjectService}
                onDelete={handleDelete}
              />
            </>
          )}
        </Space.Compact>,
      ]}
    >
      {contextHolder}
      {isEditing ? (
        <div className="w-full flex flex-col gap-3">
          <ServicesCategoriesSelect
            emitSelectedState={setSelectedService}
            servicesCategoriesState={servicesCategoriesState}
          />
          <Input.TextArea
            size="middle"
            name="description"
            placeholder="Work Description"
            value={projectState.description}
            onChange={(event) =>
              setProjectState((prevState) => ({
                ...prevState,
                description: event.target.value,
              }))
            }
          />
          <div className="flex flex-row max-sm:flex-col gap-3">
            <Input
              name="maxPrice"
              type="number"
              size="large"
              className="w-full sm:w-1/2"
              value={projectState.maxPrice}
              placeholder="Maximum price"
              onChange={(event) =>
                setProjectState((prevState) => ({
                  ...prevState,
                  maxPrice: Number(event.target.value),
                }))
              }
            />
            <DatePicker
              name="targetDate"
              size="large"
              className="w-full sm:w-1/2"
              value={dayjs(projectState.targetDate)}
              placeholder="Select deadline date"
              onChange={(pickedDate) =>
                setProjectState((prevState) => ({
                  ...prevState,
                  targetDate: pickedDate?.toDate(),
                }))
              }
            />
          </div>
          <div className="flex justify-between gap-3 sm:hidden">
            <Button
              key={`edit-${projectService.id}`}
              tabIndex={0}
              type="default"
              size="large"
              className="custom-primary-button bg-accent w-40"
              onClick={handleCancelClick}
              loading={isLoadingProjectService}
            >
              Cancel
            </Button>
            <Button
              tabIndex={0}
              type="default"
              size="large"
              className="bg-primary"
              onClick={handleSave}
              loading={isLoadingProjectService}
              icon={<Save />}
            />
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <List.Item.Meta
            title={
              <div>
                <p className="text-accent font-semibold tracking-wide">
                  {projectService.expand?.service.expand?.category.name}
                </p>
                <p className="font-bold">
                  {projectService.expand?.service.name}
                </p>
              </div>
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
          <div className="flex justify-between gap-3 sm:hidden">
            <Button
              key={`edit-${projectService.id}`}
              tabIndex={0}
              type="default"
              size="large"
              className="custom-primary-button bg-accent w-40"
              onClick={handleEditClick}
              loading={isLoadingProjectService}
            >
              Edit
            </Button>
            <PopConfirmDelete
              key={`del-${projectService.id}`}
              title="Delete service"
              description="Are you sure to delete this service?"
              isLoading={isLoadingProjectService}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </List.Item>
  );
};
