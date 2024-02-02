"use client";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FC } from "react";

import type {
  LocationFormState,
  LocationSelectState,
  LocationType,
} from "types";
import { LocationsSelect } from "./custom/LocationsSelect";
import { ServicesCategoriesSelect } from "./custom/ServicesCategoriesSelect";

const initialState: LocationFormState = {
  country: { isLoading: false },
  region: { isLoading: false },
  division: { isLoading: false },
  city: { isLoading: false },
};

export const SearchForm: FC = () => {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [locationState, setLocationState] =
    useState<LocationFormState>(initialState);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const setSelectedServiceState = useCallback(
    (type: "category" | "service", obj: LocationSelectState) => {
      if (type === "category") {
        setSelectedCategory(obj?.name ?? null);
      }
      if (type === "service") {
        setSelectedService(obj?.name ?? null);
      }
    },
    [setSelectedCategory, setSelectedService]
  );

  const setSelectedFormState = useCallback(
    (type: LocationType, payload: LocationSelectState) =>
      setLocationState((prevState) => ({ ...prevState, [type]: payload })),
    [setLocationState]
  );

  const handleSubmit = async () => {
    router.push(
      "/businesses?" +
        (selectedCategory
          ? `category=${encodeURIComponent(selectedCategory)}`
          : "") +
        clsx({ "&": selectedCategory }) +
        `service=${encodeURIComponent(selectedService!)}` +
        `&country=${encodeURIComponent(locationState.country.name!)}` +
        (locationState.region.name
          ? `&region=${encodeURIComponent(locationState.region.name)}`
          : "") +
        (locationState.division.name
          ? `&division=${encodeURIComponent(locationState.division.name)}`
          : "") +
        (locationState.city.name
          ? `&city=${encodeURIComponent(locationState.city.name)}`
          : "")
    );
  };

  return (
    <form
      className="rounded-md mx-auto p-4 bg-base-100 shadow-xl flex
                  flex-col gap-3 max-w-[248px] sm:max-w-[536px]"
    >
      <ServicesCategoriesSelect
        selectClassNames="w-[216px] sm:w-[246px]"
        emitSelectedState={setSelectedServiceState}
      />
      <LocationsSelect
        locationsState={locationState}
        selectClassNames="w-[216px] sm:w-[246px]"
        emitSelectedState={setSelectedFormState}
        emitIsLoadingState={setIsLoadingLocations}
      />
      <Button
        tabIndex={0}
        type="default"
        icon={<SearchOutlined rev="" />}
        size="large"
        disabled={!selectedService || !locationState.country.name}
        loading={isLoadingLocations}
        onClick={handleSubmit}
        className="custom-primary-button"
      >
        Search
      </Button>
    </form>
  );
};
