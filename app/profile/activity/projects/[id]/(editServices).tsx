"use client";
import { Button, DatePicker, Input, List } from "antd";
import { useState, type FC } from "react";
import type { Dayjs } from "dayjs";

import {
  ProjectServiceListItem,
  ServicesCategoriesSelect,
} from "@/components/index";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import { LocationSelectState, ProjectService } from "types";

type EditProjectServicesProps = {
  projectId: string;
  services: ProjectService[];
  onSuccess?: () => void;
};

export const EditProjectServices: FC<EditProjectServicesProps> = ({
  projectId,
  services,
  onSuccess,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [workDescription, setWorkDescription] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<Dayjs | null>(null);

  const clearChanges = () => {
    setSelectedServiceId(null);
    setWorkDescription("");
    setMaxPrice(null);
    setTargetDate(null);
  };

  const {
    mutate: createProjectService,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.createProjectService.useMutation({
    onSuccess: () => {
      clearChanges();
      onSuccess?.();
    },
  });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error creating project service"
  );

  const handleSave = () => {
    selectedServiceId &&
      workDescription &&
      createProjectService({
        projectId,
        serviceId: selectedServiceId,
        description: workDescription,
        maxPrice: maxPrice ?? 0,
        targetDate: targetDate?.toDate(),
      });
  };

  const hasChanges = !!selectedServiceId || !!workDescription;

  const setSelectedService = (
    type: "category" | "service",
    obj: LocationSelectState
  ) => {
    if (type === "service") {
      setSelectedServiceId(obj?.id ?? null);
    }
  };

  return (
    <section className="w-full pt-6 flex flex-col gap-3">
      <h4 className="section-title">Services</h4>
      {contextHolder}
      <ServicesCategoriesSelect emitSelectedState={setSelectedService} />
      <Input.TextArea
        name="description"
        placeholder="Work Description"
        value={workDescription}
        onChange={(event) => setWorkDescription(event.target.value)}
      />
      <div className="flex flex-row max-sm:flex-col gap-3">
        <Input
          name="maxPrice"
          type="number"
          size="large"
          className="w-full sm:w-1/2"
          value={maxPrice as number}
          placeholder="Maximum price"
          onChange={(event) => setMaxPrice(Number(event.target.value))}
        />
        <DatePicker
          name="targetDate"
          size="large"
          className="w-full sm:w-1/2"
          value={targetDate}
          onChange={(date) => setTargetDate(date)}
        />
      </div>
      <div className="flex justify-between max-sm:flex-wrap">
        <Button
          tabIndex={0}
          size="large"
          type="default"
          loading={isLoading}
          disabled={!projectId || !hasChanges}
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
          disabled={!projectId || !selectedServiceId || !workDescription}
          className="custom-primary-button w-40"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
      <List
        bordered
        itemLayout="horizontal"
        locale={{ emptyText: "No project services found" }}
        dataSource={services}
        renderItem={(service) => (
          <ProjectServiceListItem projectService={service} />
        )}
      />
    </section>
  );
};
