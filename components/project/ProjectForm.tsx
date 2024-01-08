"use client";
import { Button, Form, Input } from "antd";
import { useEffect, useState, type FC, useCallback } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { Project } from "types";

import type {
  LocationSelectState,
  LocationType,
  LocationFormState,
} from "types";
import { LocationsSelect } from "../custom/LocationsSelect";

const validateMessages = {
  required: "${name} is required!",
};

type ProjectFormProps = {
  project?: Project;
  isEditing?: boolean;
  onSuccess?: () => void;
};

export const ProjectForm: FC<ProjectFormProps> = ({
  isEditing,
  project,
  onSuccess,
}) => {
  const [form] = Form.useForm<Project>();
  const formValues = Form.useWatch([], form);

  const getInitialLocationState = useCallback(
    () =>
      isEditing
        ? {
            country: {
              isLoading: false,
              id: project?.expand.country.id,
              name: project?.expand.country.name,
            },
            region: {
              isLoading: false,
              id: project?.expand.region.id,
              name: project?.expand.region.name,
            },
            division: {
              isLoading: false,
              id: project?.expand.division?.id,
              name: project?.expand.division?.name,
            },
            city: {
              isLoading: false,
              id: project?.expand.city.id,
              name: project?.expand.city.name,
            },
          }
        : {
            country: { isLoading: false },
            region: { isLoading: false },
            division: { isLoading: false },
            city: { isLoading: false },
          },
    [isEditing, project]
  );

  const [locationState, setLocationState] = useState<LocationFormState>(
    getInitialLocationState
  );
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isFormValid, setIsFormValid] = useState(!!formValues?.name);

  const {
    mutate: createProject,
    isLoading: isLoadingCreate,
    isError: isErrorCreate,
    isSuccess: isSuccessCreate,
    error: errorCreate,
  } = trpc.createProject.useMutation({ onSuccess });

  const {
    mutate: updateProject,
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    isSuccess: isSuccessUpdate,
    error: errorUpdate,
  } = trpc.updateProject.useMutation({ onSuccess });

  const isLoading = isLoadingCreate || isLoadingUpdate || isLoadingLocations;

  const trimmedFormValues = {
    name: formValues?.name?.trim(),
    description: formValues?.description?.trim(),
  };

  const hasChanges =
    trimmedFormValues.name !== project?.name.trim() ||
    trimmedFormValues.description !== project?.description?.trim() ||
    locationState.country.id != project?.country ||
    locationState.region.id != project?.region ||
    locationState.division.id != project?.division ||
    locationState.city.id != project?.city;

  const contextHolder = useErrorToaster(
    isErrorCreate || isErrorUpdate,
    isSuccessCreate || isSuccessUpdate,
    (errorCreate || errorUpdate)?.message ?? "Error saving a project"
  );

  const setSelectedFormState = useCallback(
    (type: LocationType, payload: LocationSelectState) =>
      setLocationState((prevState) => ({ ...prevState, [type]: payload })),
    [setLocationState]
  );

  const clearChanges = () => {
    if (isEditing) {
      !!project && form.setFieldsValue(project);
    } else {
      form.resetFields();
    }
    setLocationState(getInitialLocationState);
  };

  const handleSave = async () => {
    if (isEditing) {
      !!project &&
        updateProject({ projectId: project.id, ...trimmedFormValues });
    } else if (
      locationState.country.id &&
      locationState.region.id &&
      locationState.city.id
    ) {
      createProject({
        ...trimmedFormValues,
        country: locationState.country.id,
        region: locationState.region.id,
        division: locationState.division.id,
        city: locationState.city.id,
      });
    }
  };

  useEffect(() => {
    !!project && form.setFieldsValue(project);
  }, [project, form]);

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () =>
        setIsFormValid(
          !!locationState.country.id &&
            !!locationState.region.id &&
            !!locationState.city.id
        ),
      () => setIsFormValid(false)
    );
  }, [form, formValues, locationState]);

  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      className="w-full"
      disabled={isLoading}
      validateMessages={validateMessages}
    >
      {contextHolder}
      <Form.Item required name="name" rules={[{ required: true }]}>
        <Input aria-required type="name" name="name" placeholder="Name" />
      </Form.Item>
      <Form.Item name="description">
        <Input.TextArea name="description" placeholder="Description" />
      </Form.Item>
      <h4 className="text-lg font-bold text-primary my-6 border-b-2 border-slate-300">
        Location
      </h4>
      <LocationsSelect
        locationsState={locationState}
        emitSelectedState={setSelectedFormState}
        emitIsLoadingState={setIsLoadingLocations}
      />
      <section className="my-3 flex justify-between">
        <Button
          tabIndex={0}
          size="large"
          type="default"
          loading={isLoading}
          disabled={!hasChanges}
          className="custom-primary-button bg-accent"
          onClick={clearChanges}
        >
          Clear Changes
        </Button>
        <Button
          tabIndex={0}
          size="large"
          type="default"
          htmlType="submit"
          loading={isLoading}
          disabled={!isFormValid || !hasChanges}
          className="custom-primary-button w-40"
          onClick={handleSave}
        >
          Save
        </Button>
      </section>
    </Form>
  );
};
