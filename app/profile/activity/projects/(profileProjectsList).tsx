"use client";
import { Alert, List } from "antd";
import { type FC } from "react";

import { ProjectListItem } from "components";
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
          <ProjectListItem key={project.id} project={project} showActions />
        )}
      />
    </section>
  );
};
