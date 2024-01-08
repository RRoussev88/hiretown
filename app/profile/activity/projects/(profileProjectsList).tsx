"use client";
import { Alert, Button, List, Modal } from "antd";
import { type FC, useState } from "react";

import { ProjectListItem, ProjectForm } from "components";
import { trpc } from "trpc";

export const ProfileProjectsList: FC = () => {
  const { data, isFetching, error, refetch } = trpc.userProjects.useQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    refetch();
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <Modal
          title="Create project"
          closable
          destroyOnClose
          open={isCreateOpen}
          onCancel={() => setIsCreateOpen(false)}
          footer={null}
        >
          <ProjectForm onSuccess={handleCloseModal} />
        </Modal>
        <p className="text-2xl text-primary-content font-semibold">
          My Projects
        </p>
        <Button
          tabIndex={0}
          onClick={() => setIsCreateOpen(true)}
          type="default"
          className="custom-primary-button"
          size="large"
        >
          Create
        </Button>
      </div>
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
            <ProjectListItem
              key={project.id}
              project={project}
              onSuccess={refetch}
              showActions
            />
          )}
        />
      </section>
    </>
  );
};
