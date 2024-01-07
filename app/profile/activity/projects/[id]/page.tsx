"use client";
import { Alert, Button, Skeleton, Space } from "antd";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";

import { ProjectForm } from "@/components/.";
import { useErrorToaster } from "hooks";
import { useEffect } from "react";
import { trpc } from "trpc";

type ProjectDetailsPageProps = { params: { id: string } };

const ProfileProjectPage: NextPage<ProjectDetailsPageProps> = ({
  params,
}) => {
  const router = useRouter();

  const {
    data: hasPermission,
    isFetching: isFetchingPermission,
    isError: isPermissionError,
    error: permissionError,
    isSuccess: isPermissionSuccess,
  } = trpc.hasProjectPermission.useQuery(params.id);

  const {
    data: project,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  } = trpc.project.useQuery(params.id, { enabled: hasPermission });

  const contextHolder = useErrorToaster(
    isError || isPermissionError,
    isSuccess || isPermissionSuccess,
    error?.message ?? permissionError?.message ?? "Error fetching project"
  );

  useEffect(() => {
    // Guard for editing other user's projects
    if (isPermissionSuccess && !hasPermission) {
      router.replace(`/projects/${params.id}`);
    }
  }, [hasPermission, isPermissionSuccess, router, params.id]);

  if (!project) {
    return (
      <div className="w-full mx-auto my-6">
        {contextHolder}
        {isFetching || isFetchingPermission ? (
          <div className="w-full mx-auto flex flex-col gap-6">
            <br />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <br />
            <br />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Space size="large">
              <Skeleton.Button active size="large" />
              <Skeleton.Button active size="large" />
            </Space>
          </div>
        ) : (
          <Alert
            showIcon
            type="info"
            message="No project found"
            className="max-w-xl mx-auto"
          />
        )}
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col text-primary-content">
      {contextHolder}
      <div className="w-full mx-auto flex flex-wrap justify-between">
        <p className="mb-5 text-2xl font-semibold">Edit Project</p>
        <Button
          tabIndex={0}
          size="large"
          type="default"
          className="custom-primary-button"
          href={`/projects/${params.id}`}
        >
          Preview
        </Button>
      </div>
      <ProjectForm isEditing project={project} onSuccess={refetch} />
    </section>
  );
};

export default ProfileProjectPage;
