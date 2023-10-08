"use client";
import { type FC, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

import type { SearchFormState, SelectState } from "./SearchForm";
import { SearchSelect } from "./SearchSelect";
import { useFetchAndSelect } from "hooks";
import { trpc, RouterInputs } from "trpc";

type SearchFormSelectProps = {
  selectorName: string;
  optionsName: Exclude<keyof RouterInputs, "signin" | "signup">;
  searchParam: keyof SearchFormState;
  setSelectedState: (type: keyof SearchFormState, obj: SelectState) => void;
  dependency?: { searchTerm?: string; [key: string]: string | undefined };
  dependencyValue?: string | null;
  dependencyParam?: string;
  allOption?: boolean;
  disable?: boolean;
};

export const SearchFormSelect: FC<SearchFormSelectProps> = ({
  selectorName,
  optionsName,
  searchParam,
  setSelectedState,
  dependency,
  dependencyValue,
  dependencyParam,
  allOption,
  disable,
}) => {
  const shouldFetchRef = useRef<boolean>(true);
  const shouldSelectRef = useRef<boolean>(true);
  const searchParams = useSearchParams();
  const [depState, setDepState] = useState({ searchTerm: "", ...dependency });
  const { data, isSuccess, isFetching, selected, setSelected, contextHolder } =
    useFetchAndSelect<any, string>(
      (trpc[optionsName] as any).useQuery,
      "Service error: Failed to load server data",
      depState
    );

  const searchedParamValue = searchParams?.get(searchParam);

  useEffect(() => {
    if (isSuccess && shouldFetchRef.current) {
      const depParamValue = searchParams?.get(dependencyParam ?? "");
      if (!dependencyParam || depParamValue === dependencyValue) {
        setDepState((prevState) => ({
          ...prevState,
          searchTerm: searchedParamValue ?? "",
        }));
        shouldFetchRef.current = false;
      }
    }
  }, [
    isSuccess,
    searchParam,
    searchParams,
    dependencyValue,
    dependencyParam,
    setDepState,
    searchedParamValue,
  ]);

  useEffect(() => {
    if (!shouldSelectRef.current) return;
    const newSelected =
      data?.items.find((item) => item.name === searchedParamValue) ?? null;

    if (newSelected) {
      setSelected(newSelected);
      shouldSelectRef.current = false;
    }
  }, [data, searchedParamValue, setSelected]);

  useEffect(() => {
    setDepState((prevState) => ({
      ...prevState,
      ...dependency,
      searchTerm: "",
    }));
    if (!!dependency) {
      setSelected(null);
    }
  }, [setDepState, dependency, setSelected]);

  useEffect(() => {
    setSelectedState(searchParam, {
      name: selected?.name,
      isLoading: isFetching,
    });
  }, [setSelectedState, searchParam, selected, isFetching]);

  return (
    <div className="w-full sm:w-1/2">
      {contextHolder}
      <SearchSelect
        label={selectorName}
        disabled={disable && !dependencyValue}
        data={data?.items ?? []}
        selected={selected}
        setSelected={(name) => {
          if (isSuccess) {
            const newSelected =
              data?.items.find((item) => item.name === name) ?? null;
            setSelected(newSelected);
            setDepState((prevState) => ({
              ...prevState,
              searchTerm: newSelected?.name,
            }));
          }
        }}
        allOption={allOption}
        searchValue={depState.searchTerm}
        setSearchValue={(searchTerm) => {
          setDepState((prevState) => ({ ...prevState, searchTerm }));
          !searchTerm && setSelected(null);
        }}
      />
    </div>
  );
};
