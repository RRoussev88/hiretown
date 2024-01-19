import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import type { FC } from "react";

type PopConfirmDeleteProps = {
  title?: string;
  description?: string;
  isLoading?: boolean;
  onDelete?: () => void;
};

export const PopConfirmDelete: FC<PopConfirmDeleteProps> = ({
  title,
  description,
  isLoading,
  onDelete,
}) => (
  <Popconfirm
    title={title ?? "Delete record"}
    description={description ?? "Are you sure to delete this record?"}
    onConfirm={onDelete}
    okText="Yes"
    cancelText="No"
    disabled={isLoading}
  >
    <Button
      tabIndex={0}
      size="large"
      type="default"
      htmlType="button"
      loading={isLoading}
      className="custom-button bg-error"
    >
      {!isLoading && <DeleteOutlined rev="" />}
    </Button>
  </Popconfirm>
);
