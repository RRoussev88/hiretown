"use client";
import { Alert, List } from "antd";
import { type FC } from "react";

import { trpc } from "trpc";

export const ProfileProjectsList: FC = () => {
  const { data, isFetching, error } = trpc.userProjects.useQuery();

  return (
    <section>
      {!isFetching && !!error && (
        <Alert message={error.message} type="error" showIcon />
      )}
      <List
        bordered
        itemLayout="vertical"
        loading={isFetching}
        locale={{ emptyText: "No projects found" }}
        dataSource={data?.items}
        renderItem={(project) => (
          <List.Item key={project.id}>
            <List.Item.Meta
              title={<p className="text-2xl underline">{project.name}</p>}
              description={
                <div className="flex flex-col gap-2">
                  {!!project.description && (
                    <p className="text-lg">{project.description}</p>
                  )}
                  <p className="text-md">
                    In&nbsp;{project.expand.country.name},&nbsp;
                    {project.expand.region.name}
                    {!!project.division && (
                      <span>,&nbsp;{project.expand.division?.name}</span>
                    )}
                    {!!project.city && (
                      <span>,&nbsp;{project.expand.city.name}</span>
                    )}
                  </p>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </section>
  );
};
