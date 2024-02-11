"use client";
import { Button, Modal } from "antd";
import { useState, type FC } from "react";

import { ProjectForm, ProjectList } from "components";

export const ProfileProjectsList: FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCloseModal = () => setIsCreateOpen(false);

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
      <ProjectList />
    </>
  );
};
