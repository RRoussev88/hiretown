"use client";
import { Alert, List } from "antd";
import { type FC, useEffect } from "react";

import { trpc } from "trpc";
import { BusinessesFilterParams } from "types";
import { BusinessCard } from "./BusinessCard";
import { BusinessListItem } from "./BusinessListItem";

type BusinessesListProps = {
  searchParams: BusinessesFilterParams;
};

export const BusinessesList: FC<BusinessesListProps> = ({ searchParams }) => {
  // TODO: Use pagination
  const {
    data: businessesData,
    isFetching,
    isError,
    error,
  } = trpc.businesses.useQuery(searchParams);

  const { mutate } = trpc.createBusinessSearch.useMutation({});

  useEffect(() => {
    mutate({
      serviceName: searchParams.service,
      countryName: searchParams.country,
      regionName: searchParams.region,
      divisionName: searchParams.division,
      cityName: searchParams.city,
    });
  }, [mutate, searchParams]);

  if (!searchParams.service || !searchParams.country) {
    return (
      <Alert
        type="warning"
        message={
          !searchParams.service
            ? "No service is selected"
            : "Please select a country"
        }
        showIcon
      />
    );
  }

  const emptyText =
    searchParams.service && searchParams.service !== "undefined"
      ? "No businesses offering that service in selected area"
      : "No service is selected";

  return (
    <section>
      {!isFetching && isError && (
        <Alert message={error?.message} type="error" showIcon />
      )}
      {!isFetching &&
        !error &&
        !!businessesData &&
        !businessesData.items.length && (
          <Alert
            showIcon
            type="info"
            message={emptyText}
            className="sm:hidden"
          />
        )}
      <div className="flex flex-wrap gap-4 sm:hidden justify-center">
        {!error &&
          !!businessesData?.items.length &&
          businessesData?.items.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
      </div>
      <List
        bordered
        itemLayout="vertical"
        size="large"
        className="max-sm:hidden w-full max-w-4xl mx-auto"
        locale={{ emptyText }}
        loading={isFetching}
        dataSource={businessesData?.items}
        renderItem={(business) => (
          <BusinessListItem key={business.id} business={business} />
        )}
      />
    </section>
  );
};
