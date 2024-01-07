"use client";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Button, List, Modal } from "antd";
import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";

import clsx from "clsx";
import { trpc } from "trpc";
import type { Business } from "types";
import { FILES_URL } from "utils";

export const BusinessListItem: FC<{
  business: Business;
  showActions?: boolean;
}> = ({ business, showActions }) => {
  const { confirm, destroyAll } = Modal;

  const { mutate: deleteBusiness, isLoading: isDeleting } =
    trpc.deleteBusiness.useMutation({ onSuccess: destroyAll });

  const showConfirm = () => {
    confirm({
      title: `Do you want to delete ${business.name}?`,
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
              deleteBusiness({ businessId: business.id });
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
                href={`/profile/activity/businesses/${business.id}`}
              >
                <EditOutlined rev="" size={16} />
              </Link>,
              <a key="delete">
                <DeleteOutlined rev="" size={16} onClick={showConfirm} />
              </a>,
            ]
          : []
      }
      key={business.id}
      extra={
        <Image
          src={
            !!business.thumbnail
              ? `${FILES_URL}/${business.collectionId}/` +
                `${business.id}/${business.thumbnail}?thumb=240x208`
              : "/mowing_guy.jpeg"
          }
          alt="Business logo"
          width={240}
          height={208}
        />
      }
    >
      <List.Item.Meta
        title={<p className="text-2xl font-semibold">{business.name}</p>}
        description={
          <p className="text-xl font-medium">{business.description}</p>
        }
      />
    </List.Item>
  );

  if (showActions) {
    return item;
  }

  return <Link href={`/businesses/${business.id}`}>{item}</Link>;
};
