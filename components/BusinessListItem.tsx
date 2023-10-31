"use client";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Button, List, Modal, Skeleton } from "antd";
import Image from "next/image";
import { type FC } from "react";

import { trpc } from "trpc";
import type { Business } from "types";
import { FILES_URL } from "utils";
import clsx from "clsx";

export const BusinessListItem: FC<{
  business: Business;
  showActions?: boolean;
}> = ({ business, showActions }) => {
  const { confirm, destroyAll } = Modal;

  const { data: businessImage, isFetching } = trpc.businessImage.useQuery(
    business.id
  );
  const { mutate: deleteBusiness, isLoading: isDeleting } =
    trpc.deleteBusiness.useMutation({ onSuccess: destroyAll });

  const showConfirm = () => {
    confirm({
      title: `Do you Want to delete ${business.name}?`,
      icon: <ExclamationCircleFilled rev="" />,
      footer: [
        <div key="footer" className="pt-4 flex justify-between">
          <Button
            key="back"
            className="custom-secondary-button"
            onClick={destroyAll}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
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
              <a
                key="edit"
                href={`/profile/activity/businesses/${business.id}`}
              >
                <EditOutlined rev="" size={16} />
              </a>,
              <a key="delete">
                <DeleteOutlined rev="" size={16} onClick={showConfirm} />
              </a>,
            ]
          : []
      }
      key={business.id}
      extra={
        isFetching ? (
          <Skeleton.Image style={{ width: 240, height: 208 }} />
        ) : (
          <Image
            src={
              businessImage
                ? `${FILES_URL}/${businessImage.collectionId}/` +
                  `${businessImage.id}/${businessImage.image}?thumb=240x208`
                : "/mowing_guy.jpeg"
            }
            alt="Business logo"
            width={240}
            height={208}
          />
        )
      }
    >
      <List.Item.Meta
        title={<p className="text-2xl font-semibold">{business.name}</p>}
        description={<p className="text-xl font-medium">{business.description}</p>}
      />
    </List.Item>
  );

  if (showActions) {
    return item;
  }

  return <a href={`/businesses/${business.id}`}>{item}</a>;
};
