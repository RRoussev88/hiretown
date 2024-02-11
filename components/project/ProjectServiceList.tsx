import { List } from "antd";
import { type FC } from "react";
import { ProjectServiceListItem } from "./ProjectServiceListItem";
import { ProjectService } from "types";

type ProjectServiceListProps = {
  services: ProjectService[];
  isSearching?: boolean;
  onSuccess?: () => void;
};

export const ProjectServiceList: FC<ProjectServiceListProps> = ({
  services,
  isSearching,
  onSuccess,
}) => (
  <List
    bordered
    itemLayout="horizontal"
    locale={{ emptyText: "No project services found" }}
    dataSource={services}
    renderItem={(service) => (
      <ProjectServiceListItem
        projectService={service}
        onSuccess={onSuccess}
        showActions={isSearching}
      />
    )}
  />
);
