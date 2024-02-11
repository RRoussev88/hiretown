"use client";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Alert, Skeleton, Space } from "antd";
import clsx from "clsx";
import type { NextPage } from "next";
import Image from "next/image";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import { ProjectServiceList } from "@/components/index";

type ProjectDetailsPageProps = { params: { id: string } };

const ProjectDetailsPage: NextPage<ProjectDetailsPageProps> = ({ params }) => {
  const {
    data: project,
    isFetching,
    isError,
    isSuccess,
    error,
  } = trpc.project.useQuery(params.id);

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error fetching project"
  );

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {isFetching ? (
          <div className="w-full flex flex-col gap-6">
            <Skeleton.Input active size="large" block />
            <br />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <br />
            <Space size="large">
              <Skeleton.Image active />
              <Skeleton.Image active />
            </Space>
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
          </div>
        ) : (
          <Alert showIcon type="info" message="No project found" />
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-primary-content p-3 sm:p-6">
      <h2 className="mb-6 text-primary-focus text-4xl">{project.name}</h2>
      {contextHolder}
      {!!project && (
        <p
          className={clsx(
            "text-xl underline font-semibold",
            project.isFinished ? "text-primary" : "text-primary-focus"
          )}
        >
          {project.isFinished ? "Finished" : "Unfinished"}
        </p>
      )}
      {!!project.description && <p className="py-3">{project.description}</p>}
      {!!project && (
        <div className="py-3">
          <Image
            src={project.expand["country"].flagImageUri}
            alt={project.expand["country"].name}
            className="inline-block mr-3"
            width={20}
            height={12}
          />
          {project.expand["country"].name}
          <span>
            <ArrowRightOutlined rev="" className="mx-3" />
            {project.expand["region"].name}
          </span>
          {!!project.expand["division"] && (
            <span>
              <ArrowRightOutlined rev="" className="mx-3" />
              {project.expand["division"].name}
            </span>
          )}
          <span>
            <ArrowRightOutlined rev="" className="mx-3" />
            {project.expand["city"].name}
          </span>
        </div>
      )}
      {/* {(project.address ||
        project.contactEmail ||
        project.contactPhone ||
        project.contactWebsite) && <ContactsSection business={project} />} */}
      {!!project.expand["projectServices(project)"]?.length && (
        <section className="my-6">
          <h4 className="text-lg font-bold text-primary mb-6 border-b-2 border-slate-300">
            Required Services
          </h4>
          <ProjectServiceList
            services={project.expand["projectServices(project)"]}
          />
        </section>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
