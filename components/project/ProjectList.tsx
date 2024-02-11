import { Alert, List } from "antd";
import { type FC } from "react";
import { ProjectListItem } from "./ProjectListItem";
import { trpc } from "trpc";

type ProjectListProps = Partial<{
  isSearching: boolean;
  countryName: string;
  regionName: string;
  divisionName: string;
  cityName: string;
  serviceName: string;
}>;

export const ProjectList: FC<ProjectListProps> = ({
  isSearching,
  countryName,
  regionName,
  divisionName,
  cityName,
  serviceName,
}) => {
  const {
    data: userProjects,
    isFetching: isFetchingUserProjects,
    error: userProjectsError,
    refetch: refetchUserProjects,
  } = trpc.userProjects.useQuery(undefined, { enabled: !isSearching });

  const {
    data: projects,
    isFetching: isFetchingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = trpc.projects.useQuery(
    {
      countryName: countryName ?? "",
      regionName: regionName ?? "",
      divisionName,
      cityName,
      serviceName,
    },
    { enabled: isSearching }
  );

  return (
    <section>
      {isSearching && !isFetchingUserProjects && !!userProjectsError && (
        <Alert message={userProjectsError.message} type="error" showIcon />
      )}
      {!isSearching && !isFetchingProjects && !!projectsError && (
        <Alert message={projectsError.message} type="error" showIcon />
      )}
      <List
        bordered
        itemLayout="vertical"
        loading={isSearching ? isFetchingProjects : isFetchingUserProjects}
        locale={{
          emptyText: `No ${isSearching ? "user" : ""} projects found`,
        }}
        dataSource={(isSearching ? projects : userProjects)?.items}
        renderItem={(project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            onSuccess={isSearching ? refetchProjects : refetchUserProjects}
            showActions={!isSearching}
          />
        )}
      />
    </section>
  );
};
