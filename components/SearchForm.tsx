"use client";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useReducer, useMemo } from "react";

import { SearchFormSelect } from "./SearchFormSelect";

export type SelectState = {
  name?: string;
  isLoading: boolean;
};

export type SearchFormState = {
  category: SelectState;
  service: SelectState;
  country: SelectState;
  region: SelectState;
  division: SelectState;
  city: SelectState;
};

const initialState: SearchFormState = {
  category: { isLoading: false },
  service: { isLoading: false },
  country: { isLoading: false },
  region: { isLoading: false },
  division: { isLoading: false },
  city: { isLoading: false },
};
// TODO: Review all the form state logic. Maybe put everything to be managed by this component
const stateReducer = (
  state: SearchFormState,
  action: { type: keyof SearchFormState; payload: SelectState }
) => ({ ...state, [action.type]: action.payload });

export const SearchForm: FC = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(stateReducer, initialState);

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

  const servicesDependency = useMemo(
    () => ({ categoryName: state.category.name }),
    [state.category.name]
  );

  const regionsDependency = useMemo(
    () => ({ countryName: state.country.name }),
    [state.country.name]
  );

  const divisionsDependency = useMemo(
    () => ({ countryName: state.country.name, regionName: state.region.name }),
    [state.country.name, state.region.name]
  );

  const citiesDependency = useMemo(
    () => ({
      countryName: state.country.name,
      regionName: state.region.name,
      divisionName: state.division.name,
    }),
    [state.country.name, state.region.name, state.division.name]
  );

  const setSelectedFormState = useCallback(
    (type: keyof SearchFormState, payload: SelectState) =>
      dispatch({ type, payload }),
    [dispatch]
  );

  const handleSubmit = () => {
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
        `&city=${encodeURIComponent(state.city.name!)}`
    );
  };

  return (
    <form className="rounded-md mx-auto p-4 bg-base-100 shadow-xl flex flex-col gap-3 sm:max-w-xl">
      <div className="flex flex-row max-sm:flex-col gap-3">
        <SearchFormSelect
          selectorName="Category"
          optionsName="serviceCategories"
          searchParam="category"
          setSelectedState={setSelectedFormState}
          allOption
        />
        <SearchFormSelect
          selectorName="Service"
          optionsName="services"
          searchParam="service"
          setSelectedState={setSelectedFormState}
          dependency={servicesDependency}
          dependencyValue={state.category.name}
          dependencyParam="category"
        />
      </div>
      <div className="flex flex-row max-sm:flex-col gap-3">
        <SearchFormSelect
          selectorName="Country"
          optionsName="countries"
          searchParam="country"
          setSelectedState={setSelectedFormState}
        />
        <SearchFormSelect
          selectorName="Region"
          optionsName="regions"
          searchParam="region"
          setSelectedState={setSelectedFormState}
          dependency={regionsDependency}
          dependencyValue={state.country.name}
          dependencyParam="country"
          allOption
          disable
        />
      </div>
      <div className="flex flex-row max-sm:flex-col gap-3">
        <SearchFormSelect
          selectorName="Division"
          optionsName="divisions"
          searchParam="division"
          setSelectedState={setSelectedFormState}
          dependency={divisionsDependency}
          dependencyValue={state.region.name}
          dependencyParam="region"
          allOption
          disable
        />
        <SearchFormSelect
          selectorName="City"
          optionsName="cities"
          searchParam="city"
          setSelectedState={setSelectedFormState}
          dependency={citiesDependency}
          dependencyValue={state.country.name}
          dependencyParam="country"
          disable
        />
      </div>
      <Button
        type="default"
        icon={<SearchOutlined rev />}
        size="large"
        disabled={isLoadingData || !state.service.name || !state.city.name}
        loading={isLoadingData}
        onClick={handleSubmit}
        className="custom-primary-button"
      >
        Search
      </Button>
    </form>
  );
};
