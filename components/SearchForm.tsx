"use client";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useReducer, type FC } from "react";

import type { LocationSelectState, LocationType } from "types";
import { LocationsSelect } from "./LocationsSelect";
import { ServicesCategoriesSelect } from "./ServicesCategoriesSelect";
import { trpc } from "trpc";

type SearchFormState = {
  [key in LocationType]: LocationSelectState;
} & {
  category: LocationSelectState;
  service: LocationSelectState;
};

const initialState: SearchFormState = {
  category: { isLoading: false },
  service: { isLoading: false },
  country: { isLoading: false },
  region: { isLoading: false },
  division: { isLoading: false },
  city: { isLoading: false },
};

const stateReducer = (
  state: SearchFormState,
  action: { type: keyof SearchFormState; payload: LocationSelectState }
) => ({ ...state, [action.type]: action.payload });

export const SearchForm: FC = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const { mutate } = trpc.createBusinessSearch.useMutation({});

  const isLoadingData = useMemo(
    () =>
      state.category.isLoading ||
      state.service.isLoading ||
      state.country.isLoading ||
      state.region.isLoading ||
      state.division.isLoading ||
      state.city.isLoading,
    [
      state.category.isLoading,
      state.service.isLoading,
      state.country.isLoading,
      state.region.isLoading,
      state.division.isLoading,
      state.city.isLoading,
    ]
  );

  const setSelectedFormState = useCallback(
    (type: keyof SearchFormState, payload: LocationSelectState) =>
      dispatch({ type, payload }),
    [dispatch]
  );

  const handleSubmit = async () => {
    await mutate({
      serviceName: state.service.name ?? "",
      countryName: state.country.name ?? "",
      regionName: state.region.name ?? "",
      divisionName: state.division.name,
      cityName: state.city.name,
    });

    router.push(
      "/businesses?" +
        (state.category.name
          ? `category=${encodeURIComponent(state.category.name)}`
          : "") +
        clsx({ "&": state.category.name }) +
        `service=${encodeURIComponent(state.service.name!)}` +
        `&country=${encodeURIComponent(state.country.name!)}` +
        (state.region.name
          ? `&region=${encodeURIComponent(state.region.name)}`
          : "") +
        (state.division.name
          ? `&division=${encodeURIComponent(state.division.name)}`
          : "") +
        (state.city.name ? `&city=${encodeURIComponent(state.city.name)}` : "")
    );
  };

  return (
    <form
      className="rounded-md mx-auto p-4 bg-base-100 shadow-xl flex
                  flex-col gap-3 max-w-[248px] sm:max-w-[536px]"
    >
      <ServicesCategoriesSelect emitSelectedState={setSelectedFormState} />
      <LocationsSelect
        selectClassNames="w-[216px] sm:w-[246px]"
        emitSelectedState={setSelectedFormState}
      />
      <Button
        tabIndex={0}
        type="default"
        icon={<SearchOutlined rev="" />}
        size="large"
        disabled={isLoadingData || !state.service.name || !state.country.name}
        loading={isLoadingData}
        onClick={handleSubmit}
        className="custom-primary-button"
      >
        Search
      </Button>
    </form>
  );
};
