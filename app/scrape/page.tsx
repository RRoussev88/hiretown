"use client";
import PocketBase from "pocketbase";
import { FC, useEffect, useRef, useState } from "react";

import { Search } from "components";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { City, Country, Division, GeoAPIResponse, Region } from "types";
import { BACKEND_URL, DataCollections } from "utils";

const pbClient = new PocketBase(BACKEND_URL);

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": process.env.NEXT_PUBLIC_GEO_API_KEY ?? "",
    "X-RapidAPI-Host": process.env.NEXT_PUBLIC_GEO_API_HOST ?? "",
  },
};

const ScrapePage: FC = () => {
  const controllerRef = useRef<AbortController | null>();
  const [fetchedRegions, setFetchedRegions] = useState<Region[]>([]);
  const [selected, setSelected] = useState<Country | null>(null);

  const { data, isSuccess, isFetching, isError, error } =
    trpc.countries.useQuery({});

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Failed to load service countries data"
  );

  // Abort data fetch if the selection is changed
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setFetchedRegions([]);
  }, [selected]);

  const onScrape = async () => {
    if (!selected) return;
    const timeout = 150;
    const limit = "100";

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setFetchedRegions([]);

    const url = new URL(
      `https://${process.env.NEXT_PUBLIC_GEO_API_HOST}/v1/geo/countries/${selected.wikiDataId}/regions`
    );
    url.searchParams.set("limit", limit);

    const regions: Region[] = [];
    let totalCount = 0;

    // First fetch regions list
    while (totalCount === 0 || regions.length < totalCount) {
      url.searchParams.set("offset", regions.length.toString());
      try {
        const regionsResponse = await fetch(url, {
          ...options,
          signal: controllerRef.current.signal,
        });
        const data: GeoAPIResponse<Region> = await regionsResponse.json();

        if (regionsResponse.ok) {
          regions.push(...data.data);
          totalCount = data.metadata.totalCount;
          await new Promise((res) =>
            setTimeout(() => res(totalCount), timeout)
          );
          console.log(`Fetched ${regions.length} out of ${totalCount} regions`);
          console.log("Fetched regions: ", regions);
        } else {
          console.warn("Fail: ", data);
          break;
        }
      } catch (error) {
        console.error("Error: ", error);
        break;
      }

      if (!totalCount) break;
    }

    url.searchParams.delete("limit");
    url.searchParams.delete("offset");

    // Fetch details for every region separately
    for (const reg of regions) {
      try {
        let region: Region;
        try {
          region = await pbClient
            .collection(DataCollections.REGIONS)
            .getFirstListItem(`wikiDataId="${reg.wikiDataId}"`);
          setFetchedRegions((prevState) => [...prevState, region]);
        } catch {
          const regionResponse = await fetch(
            `${url.toString()}/${reg.wikiDataId}`,
            {
              ...options,
              signal: controllerRef.current.signal,
            }
          );
          const data: { data: Region } = await regionResponse.json();
          region = data.data;

          if (regionResponse.ok) {
            setFetchedRegions((prevState) => [...prevState, region]);
            await new Promise((res) => setTimeout(() => res(region), timeout));

            // Save the record in our DB
            console.log("Persisting: ", region);
            await pbClient
              .collection(DataCollections.REGIONS)
              .create({ ...region, country: selected.id });
          } else {
            console.warn("Details Fail: ", data);
            break;
          }
        }

        if (!region.id) {
          continue;
        }

        const citiesUrl = new URL(
          `https://${process.env.NEXT_PUBLIC_GEO_API_HOST}/v1/geo/countries/${selected.wikiDataId}/regions/${reg.wikiDataId}/cities`
        );
        citiesUrl.searchParams.set("limit", limit);

        const cities: City[] = [];
        let totalCitiesCount = 0;

        // Fetch cities list per region
        while (totalCitiesCount === 0 || cities.length < totalCitiesCount) {
          citiesUrl.searchParams.set("offset", cities.length.toString());

          try {
            const citiesResponse = await fetch(citiesUrl, {
              ...options,
              signal: controllerRef.current.signal,
            });
            const data: GeoAPIResponse<City> = await citiesResponse.json();

            if (citiesResponse.ok) {
              cities.push(...data.data);
              totalCitiesCount = data.metadata.totalCount;
              await new Promise((res) =>
                setTimeout(() => res(totalCitiesCount), timeout)
              );
              console.log(
                `Fetched ${cities.length} out of ${totalCitiesCount} cities`
              );

              // In case current region doesn't contain any cities
              if (!totalCitiesCount || data.data.length < +limit) {
                break;
              }
            } else {
              console.warn("Cities fail: ", data);
              break;
            }
          } catch (error) {
            console.error("Cities error: ", error);
            break;
          }
          if (!totalCitiesCount) break;
        }

        // Fetch details for every city
        for (let index = 0; index < cities.length; index++) {
          const city = cities[index];
          try {
            const currentCity = await pbClient
              .collection(DataCollections.CITIES)
              .getFirstListItem(`wikiDataId="${city.wikiDataId}"`);
            console.log("Found city: ", index, currentCity);
          } catch {
            const ciryUrl = new URL(
              `https://${process.env.NEXT_PUBLIC_GEO_API_HOST}/v1/geo/cities/${city.wikiDataId}`
            );
            const cityResponse = await fetch(ciryUrl, {
              ...options,
              signal: controllerRef.current.signal,
            });
            const cityData: { data: City } = await cityResponse.json();
            const cityDetails = cityData.data;

            if (cityResponse.ok) {
              await new Promise((res) =>
                setTimeout(() => res(cityDetails), timeout)
              );

              const divisionUrl = new URL(
                `https://${process.env.NEXT_PUBLIC_GEO_API_HOST}/v1/geo/cities/${city.wikiDataId}/locatedIn`
              );
              const divisionResponse = await fetch(divisionUrl, {
                ...options,
                signal: controllerRef.current.signal,
              });

              const divisionData: { data?: Division } =
                await divisionResponse.json();
              let division = null;

              if (divisionResponse.ok && divisionData.data) {
                try {
                  division = await pbClient
                    .collection(DataCollections.DIVISIONS)
                    .getFirstListItem(
                      `wikiDataId="${divisionData.data.wikiDataId}"`
                    );
                  console.log("Found division: ", division);
                } catch {
                  console.log(
                    "Persisting: ",
                    index,
                    region.name,
                    divisionData.data.name
                  );
                  division = await pbClient
                    .collection(DataCollections.DIVISIONS)
                    .create({
                      wikiDataId: divisionData.data.wikiDataId,
                      name: divisionData.data.name,
                      countryCode: divisionData.data.countryCode,
                      regionCode: divisionData.data.regionCode,
                      latitude: divisionData.data.latitude,
                      longitude: divisionData.data.longitude,
                      population: divisionData.data.population,
                      elevationMeters: divisionData.data.elevationMeters,
                      timezone: divisionData.data.timezone,
                      country: selected.id,
                      region: region.id,
                    });
                }
              }
              await new Promise((res) =>
                setTimeout(() => res(divisionData.data), timeout)
              );

              // Save the record in our DB
              console.log("Persisting: ", index, region.name, cityDetails);
              await pbClient.collection(DataCollections.CITIES).create({
                wikiDataId: cityDetails.wikiDataId,
                name: cityDetails.name,
                countryCode: cityDetails.countryCode,
                regionCode: cityDetails.regionCode,
                latitude: cityDetails.latitude,
                longitude: cityDetails.longitude,
                population: cityDetails.population,
                elevationMeters: cityDetails.elevationMeters,
                timezone: cityDetails.timezone,
                country: selected.id,
                region: region.id,
                division: division?.id ?? null,
              });
            } else {
              console.warn("Details Fail: ", cityData);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Details error: ", error);
      }
    }
  };

  return (
    <main className="p-6">
      {contextHolder}
      <h2 className="mb-3">Scrape</h2>
      <div className="form-control">
        <div className="input-group">
          <select
            className="select select-bordered truncate w-40"
            onChange={(event) =>
              isSuccess &&
              setSelected(
                data?.find((country) => country.id === event.target.value) ??
                  null
              )
            }
          >
            {isSuccess &&
              data?.map((country: Country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
          </select>
          <button
            tabIndex={0}
            disabled={isFetching}
            className="btn btn-square"
            onClick={onScrape}
          >
            <Search />
          </button>
        </div>
      </div>
      <div className="divider" />
      <section className="mt-6">
        {fetchedRegions.length ? (
          fetchedRegions.map((region, index) => (
            <p key={region.wikiDataId}>
              {index + 1}. {region.name} - cities: {region.numCities}
            </p>
          ))
        ) : (
          <p>No Regions fetched yet</p>
        )}
      </section>
    </main>
  );
};

export default ScrapePage;
