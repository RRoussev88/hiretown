"use client";
import { Select } from "antd";
import { useErrorToaster } from "hooks";
import { type FC, useMemo, useState } from "react";

import { trpc } from "trpc";
import { SelectOption, Service, ServiceCategory } from "types";

export const ServicesCategoriesSelect: FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const {
    data: categories,
    error: categoriesError,
    isError: isCategoriesError,
    isFetching: isFetchingCategories,
    isSuccess: isSuccessCategories,
  } = trpc.serviceCategories.useQuery();
  const {
    data: services,
    error: servicesError,
    isError: isServicesError,
    isFetching: isFetchingServices,
    isSuccess: isSuccessServices,
  } = trpc.services.useQuery({});

  const categoryOptions = useMemo(
    () =>
      categories?.map((item) => ({
        key: item.id,
        value: item.id,
        label: item.name,
      })),
    [categories]
  );
  const serviceOptions = useMemo(
    () =>
      services
        ?.filter(
          (service) =>
            !selectedCategory || service.category === selectedCategory.id
        )
        .map((service) => ({
          key: service.id,
          value: service.id,
          label: service.name,
        })),
    [services, selectedCategory]
  );

  const contextHolder = useErrorToaster(
    isCategoriesError || isServicesError,
    isSuccessCategories || isSuccessServices,
    (categoriesError || servicesError)?.message ??
      "Error fetching categories or services"
  );

  const handleSelectCategory = (id: string) => {
    const newSelected = categories?.find((item) => item.id === id) ?? null;
    setSelectedCategory(newSelected);
    if (selectedService && selectedService.category !== newSelected?.id) {
      setSelectedService(null);
    }

    // TODO: Emit the services state to the parent component.
    // First try to use the select handlers. If it isnt ok - useEffect.

    // emitSelected?.(newSelected);
  };

  const handleSelectService = (id: string) => {
    const newSelectedService = services?.find((item) => item.id === id) ?? null;
    setSelectedService(newSelectedService);

    const newSelectedCategory =
      categories?.find(
        (category) => category.id === newSelectedService?.category
      ) ?? null;
    setSelectedCategory(newSelectedCategory);

    // emitSelected?.(newSelected);
  };

  const handleFilterOption = (input: string, option?: SelectOption) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <div className="flex flex-row max-sm:flex-col gap-3">
      {contextHolder}
      <Select
        allowClear
        showSearch
        size="large"
        disabled={!isSuccessCategories}
        loading={isFetchingCategories}
        className="w-[216px] sm:w-[246px]"
        placeholder="Service Category"
        optionFilterProp="children"
        filterOption={handleFilterOption}
        onSelect={handleSelectCategory}
        onClear={() => setSelectedCategory(null)}
        options={categoryOptions}
        value={selectedCategory?.name}
      />
      <Select
        allowClear
        showSearch
        size="large"
        disabled={!isSuccessServices}
        loading={isFetchingServices}
        className="w-[216px] sm:w-[246px]"
        placeholder="Service"
        optionFilterProp="children"
        filterOption={handleFilterOption}
        onSelect={handleSelectService}
        onClear={() => setSelectedService(null)}
        options={serviceOptions}
        value={selectedService?.name}
      />
    </div>
  );
};
