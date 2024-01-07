"use client";
import { Select } from "antd";
import { useCallback, useEffect, type FC } from "react";

import {
  useErrorToaster,
  useLocationsState,
  useSearchParamsPopulate,
} from "hooks";
import type {
  LocationFormState,
  LocationSelectState,
  LocationType,
  SelectOption,
} from "types";

type LocationsSelectType = {
  locationsState?: LocationFormState;
  selectClassNames?: string;
  emitSelectedState: (type: LocationType, obj: LocationSelectState) => void;
  emitIsLoadingState?: (isLoading: boolean) => void;
};

export const LocationsSelect: FC<LocationsSelectType> = ({
  locationsState,
  selectClassNames,
  emitSelectedState,
  emitIsLoadingState,
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
    isLoadingLocations,
  } = useLocationsState();

  const handleSelectCountry = useCallback(
    (id?: string) => {
      const newSelected = countries?.find((item) => item.id === id) ?? null;
      setSelectedCountry(newSelected);
      emitSelectedState("country", {
        id,
        name: newSelected?.name,
        isLoading: false,
      });

      if (selectedRegion && selectedRegion.country !== newSelected?.id) {
        setSelectedRegion(null);
        setSelectedDivision(null);
        setSelectedCity(null);
        emitSelectedState("region", { isLoading: false });
        emitSelectedState("division", { isLoading: false });
        emitSelectedState("city", { isLoading: false });
      }
    },
    [
      countries,
      selectedRegion,
      setSelectedCountry,
      setSelectedRegion,
      setSelectedDivision,
      setSelectedCity,
      emitSelectedState,
    ]
  );
  const handleSelectRegion = useCallback(
    (id?: string) => {
      const newSelected = regions?.find((item) => item.id === id) ?? null;
      setSelectedRegion(newSelected);
      emitSelectedState("region", {
        id,
        name: newSelected?.name,
        isLoading: false,
      });

      if (selectedDivision && selectedDivision.region !== newSelected?.id) {
        setSelectedDivision(null);
        emitSelectedState("division", { isLoading: false });
      }
      if (selectedCity && selectedCity.region !== newSelected?.id) {
        setSelectedCity(null);
        emitSelectedState("city", { isLoading: false });
      }
    },
    [
      regions,
      selectedDivision,
      selectedCity,
      setSelectedRegion,
      setSelectedDivision,
      setSelectedCity,
      emitSelectedState,
    ]
  );
  const handleSelectDivision = useCallback(
    (id?: string) => {
      const newSelected = divisions?.find((item) => item.id === id) ?? null;
      setSelectedDivision(newSelected);
      emitSelectedState("division", {
        id,
        name: newSelected?.name,
        isLoading: false,
      });

      if (selectedCity && selectedCity.division !== newSelected?.id) {
        setSelectedCity(null);
        emitSelectedState("city", { isLoading: false });
      }
    },
    [
      divisions,
      selectedCity,
      setSelectedDivision,
      setSelectedCity,
      emitSelectedState,
    ]
  );
  const handleSelectCity = useCallback(
    (id?: string) => {
      const newSelectedCity = cities?.find((item) => item.id === id) ?? null;
      setSelectedCity(newSelectedCity);
      emitSelectedState("city", {
        id,
        name: newSelectedCity?.name,
        isLoading: false,
      });
    },
    [cities, setSelectedCity, emitSelectedState]
  );

  const handleFilterOption = (input: string, option?: SelectOption) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const contextHolder = useErrorToaster(
    isErrorCountries || isErrorRegions || isErrorDivisions || isErrorCities,
    isSuccessCountries &&
      isSuccessRegions &&
      isSuccessDivisions &&
      isSuccessCities,
    (errorCountries ?? errorRegions ?? errorDivisions ?? errorCities)
      ?.message ?? "Error fetching locations data"
  );

  useEffect(() => {
    if (!!locationsState) {
      locationsState?.country?.id &&
        handleSelectCountry(locationsState.country.id);
      locationsState?.region?.id &&
        handleSelectRegion(locationsState.region.id);
      locationsState?.division?.id &&
        handleSelectDivision(locationsState.division.id);
      locationsState?.city?.id && handleSelectCity(locationsState.city.id);
    }
  }, [
    locationsState,
    handleSelectCountry,
    handleSelectRegion,
    handleSelectDivision,
    handleSelectCity,
  ]);

  useEffect(() => {
    emitIsLoadingState?.(isLoadingLocations);
  }, [emitIsLoadingState, isLoadingLocations]);

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
    {
      data: cities,
      isSuccess: isSuccessCities,
      handleSelect: handleSelectCity,
    }
  );

  return (
    <div className="flex flex-col gap-3">
      {contextHolder}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessCountries}
          loading={isFetchingCountries}
          className={selectClassNames ?? "w-full sm:w-1/2"}
          placeholder="Country"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectCountry}
          onClear={handleSelectCountry}
          options={countryOptions}
          value={selectedCountry?.name}
        />
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessRegions}
          loading={isFetchingRegions}
          className={selectClassNames ?? "w-full sm:w-1/2"}
          placeholder="Region"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectRegion}
          onClear={handleSelectRegion}
          options={regionOptions}
          value={selectedRegion?.name}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessDivisions}
          loading={isFetchingDivisions}
          className={selectClassNames ?? "w-full sm:w-1/2"}
          placeholder="Division"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectDivision}
          onClear={handleSelectDivision}
          options={divisionOptions}
          value={selectedDivision?.name}
        />
        <Select
          allowClear
          showSearch
          size="large"
          disabled={!isSuccessCities}
          loading={isFetchingCities}
          className={selectClassNames ?? "w-full sm:w-1/2"}
          placeholder="City"
          optionFilterProp="children"
          filterOption={handleFilterOption}
          onSelect={handleSelectCity}
          onClear={handleSelectCity}
          options={cityOptions}
          value={selectedCity?.name}
        />
      </div>
    </div>
  );
};
