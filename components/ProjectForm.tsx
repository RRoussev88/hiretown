"use client";
import { Button, Form, Input } from "antd";
import { useEffect, useState, type FC } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { Project } from "types";

import type { LocationSelectState, LocationType, AddressLocation } from "types";
import { LocationsSelect } from "./LocationsSelect";
import { initialLocationState } from "utils";

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

  const [locationState, setLocationState] =
    useState<AddressLocation>(initialLocationState);
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

  const isLoading = isLoadingCreate || isLoadingUpdate;

  const trimmedFormValues = {
    name: formValues?.name?.trim(),
    description: formValues?.description?.trim(),
  };

  const hasChanges =
    trimmedFormValues.name !== project?.name.trim() ||
    trimmedFormValues.description !== project?.description?.trim();

  const contextHolder = useErrorToaster(
    isErrorCreate || isErrorUpdate,
    isSuccessCreate || isSuccessUpdate,
    (errorCreate || errorUpdate)?.message ?? "Error saving a project"
  );

  const setSelectedFormState = (
    type: LocationType,
    payload: LocationSelectState
  ) => {
    if (
      !payload.isLoading &&
      payload.id &&
      locationState[type] !== payload.id
    ) {
      setLocationState((prevState) => ({ ...prevState, [type]: payload.id }));
    }
  };

  const clearChanges = () => {
    setLocationState(initialLocationState);
    if (isEditing) {
      !!project && form.setFieldsValue(project);
    } else {
      form.resetFields();
    }
  };

  const handleSave = async () => {
    if (isEditing) {
      !!project &&
        updateProject({ projectId: project.id, ...trimmedFormValues });
    } else {
      createProject({ ...trimmedFormValues, ...locationState });
    }
  };

  useEffect(() => {
    if (!!project) {
      form.setFieldsValue(project);
    }
  }, [project, form]);

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => setIsFormValid(true),
      () => setIsFormValid(false)
    );
  }, [form, formValues]);

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
      <LocationsSelect emitSelectedState={setSelectedFormState} />
      <section className="my-3 flex justify-between">
        <Button
          tabIndex={0}
          size="large"
          type="default"
          loading={isLoading}
          disabled={isLoading || !hasChanges}
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
          disabled={!isFormValid || isLoading || !hasChanges}
          className="custom-primary-button w-40"
          onClick={handleSave}
        >
          Save
        </Button>
      </section>
    </Form>
  );
};
