"use client";
import { Alert, List, Skeleton } from "antd";
import type { FC } from "react";

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

  if (!searchParams.service || !searchParams.country || !searchParams.city) {
    return (
      <Alert
        type="warning"
        message={
          !searchParams.service
            ? "No service is selected"
            : "Please select a country and a city"
        }
        showIcon
      />
    );
  }

  const emptyText =
    searchParams.service && searchParams.service !== "undefined"
      ? "No businesses offering that service"
      : "No service is selected";

  return (
    <section>
      {!isFetching && isError && (
        <Alert message={error?.message} type="error" showIcon />
      )}
      <>
        <div className="flex flex-wrap gap-4 sm:hidden">
          <Skeleton loading={isFetching}>
            {!isFetching &&
              !error &&
              !!businessesData?.items.length &&
              businessesData?.items.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            {!isFetching &&
              !error &&
              !!businessesData &&
              !businessesData.items.length && (
                <Alert showIcon type="info" message={emptyText} />
              )}
          </Skeleton>
        </div>
        <List
          bordered
          itemLayout="vertical"
          size="large"
          className="max-sm:hidden"
          locale={{ emptyText }}
          loading={isFetching}
          dataSource={businessesData?.items}
          renderItem={(business) => (
            <BusinessListItem
              key={business.id}
              business={business}
              isLoading={isFetching}
            />
          )}
        />
      </>
    </section>
  );
};
