"use client";
import { Form, Input } from "antd";
import { useCallback, useEffect, useState, type FC } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { Project } from "types";

import type {
  LocationFormState,
  LocationSelectState,
  LocationType,
} from "types";
import { LocationsSelect } from "../custom/LocationsSelect";
import { SaveAndClearButtons } from "../custom/SaveAndClearButtons";

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
  const [isFormValid, setIsFormValid] = useState(
    !!formValues?.name &&
      !!locationState.country.id &&
      !!locationState.region.id &&
      !!locationState.city.id
  );

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
    country: locationState.country.id,
    region: locationState.region.id,
    division: locationState.division.id ?? "",
    city: locationState.city.id,
  };

  const hasChanges =
    trimmedFormValues.name !== project?.name.trim() ||
    trimmedFormValues.description !== project?.description?.trim() ||
    trimmedFormValues.country != project?.country ||
    trimmedFormValues.region != project?.region ||
    trimmedFormValues.division != project?.division ||
    trimmedFormValues.city != project?.city;

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
    setIsFormValid(
      !!formValues?.name &&
        !!locationState.country.id &&
        !!locationState.region.id &&
        !!locationState.city.id
    );
  }, [formValues, locationState]);

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
      <article className="flex flex-col gap-3">
        <LocationsSelect
          locationsState={locationState}
          emitSelectedState={setSelectedFormState}
          emitIsLoadingState={setIsLoadingLocations}
        />
        <SaveAndClearButtons
          isLoading={isLoading}
          isClearDisabled={!hasChanges}
          isSaveDisabled={!isFormValid || !hasChanges}
          onClear={clearChanges}
          onSave={handleSave}
        />
      </article>
    </Form>
  );
};
