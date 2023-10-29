"use client";
import { Button, Modal } from "antd";
import { type FC, useState } from "react";

import { BusinessForm } from "@/components/.";

export const ProfileBusinessesHeader: FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCloseModal = () => setIsCreateOpen(false);

  return (
    <div className="mb-5 flex items-center justify-between">
      <Modal
        title="Create business"
        closable
        destroyOnClose
        open={isCreateOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <BusinessForm onSuccess={handleCloseModal} />
      </Modal>
      <p className="text-2xl text-primary-content">My Businesses</p>
      <Button
        onClick={() => setIsCreateOpen(true)}
        type="default"
        className="custom-primary-button"
        size="large"
      >
        Create
      </Button>
    </div>
  );
};
