"use client";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, List } from "antd";
import Link from "next/link";
import { type FC } from "react";

import { trpc } from "trpc";

export const BusinessSearchesList: FC = () => {
  const {
    data: searchesData,
    isFetching,
    error,
  } = trpc.businessSearches.useQuery();

  return (
    <section>
      {!isFetching && !!error && (
        <Alert message={error.message} type="error" showIcon />
      )}
      <List
        bordered
        itemLayout="vertical"
        loading={isFetching}
        locale={{ emptyText: "No search results found" }}
        dataSource={searchesData?.items}
        renderItem={(search) => (
          <List.Item
            key={search.id}
            actions={[
              <Link
                key="edit"
                href={
                  `/businesses?service=${search.serviceName}` +
                  `&country=${search.countryName}` +
                  (search.regionName ? `&region=${search.regionName}` : "") +
                  (search.divisionName
                    ? `&division=${search.divisionName}`
                    : "") +
                  (search.cityName ? `&city=${search.cityName}` : "")
                }
              >
                <SearchOutlined rev="" size={16} /> Search Again
              </Link>,
            ]}
          >
            <List.Item.Meta
              title={
                <p className="text-2xl">
                  Service:&nbsp;
                  <span className="underline">{search.serviceName}</span>
                </p>
              }
              description={
                <p className="text-xl font-medium">
                  In&nbsp;{search.countryName}
                  {!!search.regionName && (
                    <span>,&nbsp;{search.regionName}</span>
                  )}
                  {!!search.divisionName && (
                    <span>,&nbsp;{search.divisionName}</span>
                  )}
                  {!!search.cityName && <span>,&nbsp;{search.cityName}</span>}
                </p>
              }
            />
          </List.Item>
        )}
      />
    </section>
  );
};
