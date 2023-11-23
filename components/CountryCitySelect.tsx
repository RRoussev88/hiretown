"use client";
import { Select } from "antd";
import { useCallback, type FC, useMemo } from "react";

import {
  useEmitLocationsState,
  useErrorToaster,
  useLocationsState,
  useSearchParamsPopulate,
} from "hooks";
import { SelectOption } from "types";
import type { SearchFormState, SelectState } from "./SearchForm";

type CountryCitySelectType = {
  emitSelectedState: (type: keyof SearchFormState, obj: SelectState) => void;
};

export const CountryCitySelect: FC<CountryCitySelectType> = ({
  emitSelectedState,
}) => {
  const {
    countries: {
      data: countries,
      options: countryOptions,
      setSelected: setSelectedCountry,
      selected: selectedCountry,
      isFetching: isFetchingCountries,
      isSuccess: isSuccessCountries,
      isError: isErrorCountries,
      error: errorCountries,
    },
    regions: {
      data: regions,
      options: regionOptions,
      setSelected: setSelectedRegion,
      selected: selectedRegion,
      isFetching: isFetchingRegions,
      isSuccess: isSuccessRegions,
      isError: isErrorRegions,
      error: errorRegions,
    },
    divisions: {
      data: divisions,
      options: divisionOptions,
      setSelected: setSelectedDivision,
      selected: selectedDivision,
      isFetching: isFetchingDivisions,
      isSuccess: isSuccessDivisions,
      isError: isErrorDivisions,
      error: errorDivisions,
    },
    cities: {
      data: cities,
      options: cityOptions,
      setSelected: setSelectedCity,
      selected: selectedCity,
      isFetching: isFetchingCities,
      isSuccess: isSuccessCities,
      isError: isErrorCities,
      error: errorCities,
    },
  } = useLocationsState();

  const handleSelectCountry = useCallback(
    (id: string) => {
      const newSelected = countries?.find((item) => item.id === id) ?? null;
      setSelectedCountry(newSelected);

      if (selectedRegion && selectedRegion.country !== newSelected?.id) {
        setSelectedRegion(null);
        setSelectedDivision(null);
        setSelectedCity(null);
      }
    },
    [
      countries,
      selectedRegion,
      setSelectedCountry,
      setSelectedRegion,
      setSelectedDivision,
      setSelectedCity,
    ]
  );
  const handleSelectRegion = useCallback(
    (id: string) => {
      const newSelected = regions?.find((item) => item.id === id) ?? null;
      setSelectedRegion(newSelected);

      if (selectedDivision && selectedDivision.region !== newSelected?.id) {
        setSelectedDivision(null);
      }
      if (selectedCity && selectedCity.region !== newSelected?.id) {
        setSelectedCity(null);
      }
    },
    [
      regions,
      selectedDivision,
      selectedCity,
      setSelectedRegion,
      setSelectedDivision,
      setSelectedCity,
    ]
  );
  const handleSelectDivision = useCallback(
    (id: string) => {
      const newSelected = divisions?.find((item) => item.id === id) ?? null;
      setSelectedDivision(newSelected);

      if (selectedCity && selectedCity.division !== newSelected?.id) {
        setSelectedCity(null);
      }
    },
    [divisions, selectedCity, setSelectedDivision, setSelectedCity]
  );
  const handleSelectCity = useCallback(
    (id: string) => {
      const newSelectedCity = cities?.find((item) => item.id === id) ?? null;
      setSelectedCity(newSelectedCity);
    },
    [cities, setSelectedCity]
  );

  const contextHolder = useErrorToaster(
    isErrorCities || isErrorRegions || isErrorDivisions || isErrorCities,
    isSuccessCountries &&
      isSuccessRegions &&
      isSuccessDivisions &&
      isSuccessCities,
    (errorCountries ?? errorRegions ?? errorDivisions ?? errorCities)
      ?.message ?? "Error fetching locations data"
  );

  useEmitLocationsState(
    emitSelectedState,
    useMemo(
      () => ({ name: selectedCountry?.name, isLoading: isFetchingCountries }),
      [selectedCountry, isFetchingCountries]
    ),
    useMemo(
      () => ({ name: selectedRegion?.name, isLoading: isFetchingRegions }),
      [selectedRegion, isFetchingRegions]
    ),
    useMemo(
      () => ({ name: selectedDivision?.name, isLoading: isFetchingDivisions }),
      [selectedDivision, isFetchingDivisions]
    ),
    useMemo(
      () => ({ name: selectedCity?.name, isLoading: isFetchingCities }),
      [selectedCity, isFetchingCities]
    )
  );

  useSearchParamsPopulate(
    {
      data: countries,
      isSuccess: isSuccessCountries,
      handleSelect: handleSelectCountry,
    },
    {
      data: regions,
      isSuccess: isSuccessRegions,
      handleSelect: handleSelectRegion,
    },
    {
      data: divisions,
      isSuccess: isSuccessDivisions,
      handleSelect: handleSelectDivision,
    },
    { data: cities, isSuccess: isSuccessCities, handleSelect: handleSelectCity }
  );

  const handleFilterOption = (input: string, option?: SelectOption) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <>
      {contextHolder}
      <div className="flex flex-row max-sm:flex-col gap-3">
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessCountries}
          loading={isFetchingCountries}
          className="w-[216px] sm:w-[246px]"
          placeholder="Country"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectCountry}
          onClear={() => setSelectedCountry(null)}
          options={countryOptions}
          value={selectedCountry?.name}
        />
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessRegions}
          loading={isFetchingRegions}
          className="w-[216px] sm:w-[246px]"
          placeholder="Region"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectRegion}
          onClear={() => setSelectedRegion(null)}
          options={regionOptions}
          value={selectedRegion?.name}
        />
      </div>
      <div className="flex flex-row max-sm:flex-col gap-3">
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessDivisions}
          loading={isFetchingDivisions}
          className="w-[216px] sm:w-[246px]"
          placeholder="Division"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectDivision}
          onClear={() => setSelectedDivision(null)}
          options={divisionOptions}
          value={selectedDivision?.name}
        />
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessCities}
          loading={isFetchingCities}
          className="w-[216px] sm:w-[246px]"
          placeholder="City"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectCity}
          onClear={() => setSelectedCity(null)}
          options={cityOptions}
          value={selectedCity?.name}
        />
      </div>
    </>
  );
};
