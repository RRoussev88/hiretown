import { useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";
import { trpc } from "trpc";
import type { City, Country, Division, Region } from "types";

export const useLocationsState = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const countriesData = trpc.countries.useQuery({});
  const regionsData = trpc.regions.useQuery(
    { countryName: selectedCountry?.name },
    { enabled: !!selectedCountry }
  );
  const divisionsData = trpc.divisions.useQuery(
    { countryName: selectedCountry?.name, regionName: selectedRegion?.name },
    { enabled: !!selectedRegion }
  );
  const citiesData = trpc.cities.useQuery(
    {
      countryName: selectedCountry?.name,
      regionName: selectedRegion?.name,
      divisionName: selectedDivision?.name,
    },
    { enabled: !!selectedRegion }
  );

  const countryOptions = useMemo(
    () =>
      countriesData.data?.map((country) => ({
        key: country.id,
        value: country.id,
        label: country.name,
      })),
    [countriesData.data]
  );
  const regionOptions = useMemo(
    () =>
      regionsData.data
        ?.filter((region) => region.country === selectedCountry?.id)
        .map((region) => ({
          key: region.id,
          value: region.id,
          label: region.name,
        })),
    [regionsData.data, selectedCountry]
  );
  const divisionOptions = useMemo(
    () =>
      divisionsData.data
        ?.filter((division) => division.region === selectedRegion?.id)
        .map((division) => ({
          key: division.id,
          value: division.id,
          label: division.name,
        })),
    [divisionsData.data, selectedRegion]
  );
  const cityOptions = useMemo(
    () =>
      citiesData.data
        ?.filter((city) => city.region === selectedRegion?.id)
        .filter(
          (city) => !selectedDivision || city.division === selectedDivision.id
        )
        .map((city) => ({
          key: city.id,
          value: city.id,
          label: city.name,
        })),
    [citiesData.data, selectedRegion, selectedDivision]
  );

  return {
    countries: {
      ...countriesData,
      selected: selectedCountry,
      setSelected: setSelectedCountry,
      options: countryOptions,
    },
    regions: {
      ...regionsData,
      selected: selectedRegion,
      setSelected: setSelectedRegion,
      options: regionOptions,
    },
    divisions: {
      ...divisionsData,
      selected: selectedDivision,
      setSelected: setSelectedDivision,
      options: divisionOptions,
    },
    cities: {
      ...citiesData,
      selected: selectedCity,
      setSelected: setSelectedCity,
      options: cityOptions,
    },
    isLoadingLocations:
      countriesData.isFetching ||
      regionsData.isFetching ||
      divisionsData.isFetching ||
      citiesData.isFetching,
  };
};

type StatePopulate<T> = {
  data?: T[];
  isSuccess: boolean;
  handleSelect: (id: string) => void;
};

export const useSearchParamsPopulate = (
  countryState: StatePopulate<Country>,
  regionState: StatePopulate<Region>,
  divisionState: StatePopulate<Division>,
  cityState: StatePopulate<City>
) => {
  const reselectRef = useRef<{
    country: boolean;
    region: boolean;
    division: boolean;
    city: boolean;
  }>({
    country: false,
    region: false,
    division: false,
    city: false,
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!countryState.isSuccess) return;
    if (reselectRef.current.country) return;
    reselectRef.current.country = true;

    const countryParam = searchParams?.get("country");
    if (countryParam) {
      const searchedCountry = countryState.data?.find(
        (country) => country.name === countryParam
      );
      searchedCountry && countryState.handleSelect(searchedCountry.id);
    }
  }, [searchParams, countryState]);
  useEffect(() => {
    if (!regionState.isSuccess) return;
    if (reselectRef.current.region) return;
    reselectRef.current.region = true;

    const regionParam = searchParams?.get("region");
    if (regionParam) {
      const searchedRegion = regionState.data?.find(
        (region) => region.name === regionParam
      );
      searchedRegion && regionState.handleSelect(searchedRegion.id);
    }
  }, [searchParams, regionState]);
  useEffect(() => {
    if (!divisionState.isSuccess) return;
    if (reselectRef.current.division) return;
    reselectRef.current.division = true;

    const divisionParam = searchParams?.get("division");
    if (divisionParam) {
      const searchedDivision = divisionState.data?.find(
        (division) => division.name === divisionParam
      );
      searchedDivision && divisionState.handleSelect(searchedDivision.id);
    }
  }, [searchParams, divisionState]);
  useEffect(() => {
    if (!cityState.isSuccess) return;
    if (reselectRef.current.city) return;
    reselectRef.current.division = true;
    reselectRef.current.city = true;

    const cityParam = searchParams?.get("city");
    if (cityParam) {
      const searchedCity = cityState.data?.find(
        (city) => city.name === cityParam
      );
      searchedCity && cityState.handleSelect(searchedCity.id);
    }
  }, [searchParams, cityState]);
};
