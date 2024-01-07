"use client";
import { Select } from "antd";
import { useErrorToaster } from "hooks";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

import { trpc } from "trpc";
import type {
  LocationSelectState,
  SelectOption,
  Service,
  ServiceCategory,
} from "types";

type ServicesCategoriesSelectType = {
  emitSelectedState: (
    type: "category" | "service",
    obj: LocationSelectState
  ) => void;
};

export const ServicesCategoriesSelect: FC<ServicesCategoriesSelectType> = ({
  emitSelectedState,
}) => {
  const searchParams = useSearchParams();
  const reselectRef = useRef<boolean>(false);
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
      categories?.map((category) => ({
        key: category.id,
        value: category.id,
        label: category.name,
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

  const handleSelectCategory = useCallback(
    (id: string) => {
      const newSelected = categories?.find((item) => item.id === id) ?? null;
      setSelectedCategory(newSelected);
      if (selectedService && selectedService.category !== newSelected?.id) {
        setSelectedService(null);
      }
    },
    [categories, selectedService]
  );

  const handleSelectService = useCallback(
    (id: string) => {
      const newSelectedService =
        services?.find((item) => item.id === id) ?? null;
      setSelectedService(newSelectedService);

      const newSelectedCategory =
        categories?.find(
          (category) => category.id === newSelectedService?.category
        ) ?? null;
      setSelectedCategory(newSelectedCategory);
    },
    [categories, services]
  );

  useEffect(() => {
    emitSelectedState("category", {
      name: selectedCategory?.name,
      isLoading: isFetchingCategories,
    });
  }, [emitSelectedState, selectedCategory, isFetchingCategories]);

  useEffect(() => {
    emitSelectedState("service", {
      name: selectedService?.name,
      isLoading: isFetchingServices,
    });
  }, [emitSelectedState, selectedService, isFetchingServices]);

  // In case there are search parameters to be populated in the selects
  useEffect(() => {
    if (!isSuccessCategories || !isSuccessServices) return;
    if (reselectRef.current) return;
    reselectRef.current = true;

    const categoryParam = searchParams?.get("category");
    if (categoryParam) {
      const searchedCategory = categories?.find(
        (category) => category.name === categoryParam
      );
      searchedCategory && handleSelectCategory(searchedCategory.id);
    }

    const serviceParam = searchParams?.get("service");
    if (serviceParam) {
      const searchedService = services?.find(
        (service) => service.name === serviceParam
      );
      searchedService && handleSelectService(searchedService.id);
    }
  }, [
    searchParams,
    categories,
    isSuccessCategories,
    services,
    isSuccessServices,
    handleSelectCategory,
    handleSelectService,
  ]);

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
