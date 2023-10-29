"use client";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Alert, Skeleton } from "antd";
import Image from "next/image";
import { FC } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { City, Country, Division, Region } from "types";

type AreasSectionProps = { businessId: string };

export const AreasSection: FC<AreasSectionProps> = ({ businessId }) => {
  const {
    data: businessAreas,
    isFetching,
    isSuccess,
    isError,
    error,
  } = trpc.businessAreas.useQuery({ businessId });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error loading areas"
  );

  return (
    <section className="my-6">
      <h4 className="text-lg font-bold text-primary mb-6 border-b-2 border-slate-300">
        Available In
      </h4>
      {contextHolder}
      <Skeleton loading={isFetching}>
        {!!businessAreas?.items.length ? (
          businessAreas?.items.map((area) => {
            const country = area.expand.country as Country;
            const region = area.expand.region as Region;
            const division = area.expand.division as Division;
            const city = area.expand.city as City;

            return (
              <div key={area.id} className="my-3 w-full flex justify-between">
                <div>
                  <Image
                    src={country.flagImageUri}
                    alt={country.name}
                    className="inline-block mr-3"
                    width={20}
                    height={20}
                  />
                  {country.name}
                  {!!region && (
                    <span>
                      <ArrowRightOutlined rev="" className="mx-3" />
                      {region.name}
                    </span>
                  )}
                  {!!division && (
                    <span>
                      <ArrowRightOutlined rev="" className="mx-3" />
                      {division.name}
                    </span>
                  )}
                  {!!city && (
                    <span>
                      <ArrowRightOutlined rev="" className="mx-3" />
                      {city.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <Alert showIcon type="info" message="No areas found" />
        )}
      </Skeleton>
    </section>
  );
};
