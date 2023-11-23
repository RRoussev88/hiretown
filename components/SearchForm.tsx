"use client";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useReducer, useMemo } from "react";

import { CountryCitySelect } from "./CountryCitySelect";
import { ServicesCategoriesSelect } from "./ServicesCategoriesSelect";

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
    <form
      className="rounded-md mx-auto p-4 bg-base-100 shadow-xl flex
                  flex-col gap-3 max-w-[248px] sm:max-w-[536px]"
    >
      <ServicesCategoriesSelect emitSelectedState={setSelectedFormState} />
      <CountryCitySelect emitSelectedState={setSelectedFormState} />
      <Button
        type="default"
        icon={<SearchOutlined rev="" />}
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
