"use client";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Button, List, Modal } from "antd";
import Link from "next/link";
import { type FC } from "react";

import clsx from "clsx";
import { trpc } from "trpc";
import type { Project } from "types";

export const ProjectListItem: FC<{
  project: Project;
  showActions?: boolean;
  onSuccess?: () => void;
}> = ({ project, showActions, onSuccess }) => {
  const { confirm, destroyAll } = Modal;

  const { mutate: deleteProject, isLoading: isDeleting } =
    trpc.deleteProject.useMutation({
      onSuccess: () => {
        destroyAll();
        onSuccess?.();
      },
    });

  const showConfirm = () => {
    confirm({
      title: `Do you want to delete ${project.name}?`,
      icon: <ExclamationCircleFilled rev="" />,
      footer: [
        <div key="footer" className="pt-4 flex justify-between">
          <Button
            tabIndex={0}
            key="back"
            className="custom-secondary-button"
            onClick={destroyAll}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            tabIndex={0}
            key="submit"
            type="default"
            className="custom-primary-button"
            loading={isDeleting}
            onClick={() => {
              deleteProject({ projectId: project.id });
            }}
          >
            Confirm
          </Button>
        </div>,
      ],
    });
  };

  const item = (
    <List.Item
      className={clsx({ "shadow hover:opacity-60": !showActions })}
      actions={
        showActions
          ? [
              <Link
                key="edit"
                href={`/profile/activity/projects/${project.id}`}
              >
                <EditOutlined rev="" size={16} />
              </Link>,
              <a key="delete">
                <DeleteOutlined rev="" size={16} onClick={showConfirm} />
              </a>,
            ]
          : []
      }
      key={project.id}
    >
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
              {!!project.city && <span>,&nbsp;{project.expand.city.name}</span>}
            </p>
          </div>
        }
      />
    </List.Item>
  );

  if (showActions) {
    return item;
  }

  return <Link href={`/businesses/${project.id}`}>{item}</Link>;
};
