"use client";
import { Alert, List, Skeleton } from "antd";
import { useContext, type FC } from "react";

import { BusinessCard, BusinessListItem } from "components";
import { AuthContext } from "context/AuthContext";
import { trpc } from "trpc";
import { StorageKeys } from "utils";

export const ProfileBusinessesList: FC = () => {
  const { [StorageKeys.CURRENT_USER]: user } = useContext(AuthContext);
  // TODO: Use scroll pagination
  const {
    data: businessesData,
    isFetching,
    error,
  } = trpc.userBusinesses.useQuery({
    userId: user?.id ?? "",
  });

  const emptyText = 'No businesses found. Click "Create Business" to start';

  return (
    <section>
      {!isFetching && !!error && (
        <Alert message={error.message} type="error" showIcon />
      )}
      <>
        <div className="flex flex-wrap gap-4 sm:hidden justify-center">
          <Skeleton loading={isFetching}>
            {!isFetching &&
              !error &&
              !!businessesData?.items.length &&
              businessesData?.items
                .map((permission) => permission.expand["business"])
                .map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    showActions
                  />
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
          loading={isFetching}
          locale={{ emptyText }}
          dataSource={businessesData?.items.map(
            (permission) => permission.expand["business"]
          )}
          renderItem={(business) => (
            <BusinessListItem
              key={business.id}
              business={business}
              showActions
              isLoading={isFetching}
            />
          )}
        />
      </>
    </section>
  );
};
