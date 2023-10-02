"use client";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Button, Card, Modal, Skeleton } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FC } from "react";

import { trpc } from "../trpc";
import type { Business } from "../types";
import { FILES_URL } from "../utils";

export const BusinessCard: FC<{
  business: Business;
  showActions?: boolean;
}> = ({ business, showActions }) => {
  const router = useRouter();
  const { confirm, destroyAll } = Modal;

  const { data: businessImage, isFetching } = trpc.businessImage.useQuery(
    business.id
  );
  const { mutate: deleteBusiness, isLoading } = trpc.deleteBusiness.useMutation(
    { onSuccess: destroyAll }
  );

  const showConfirm = () => {
    confirm({
      title: `Do you Want to delete ${business.name}?`,
      icon: <ExclamationCircleFilled rev="exclamation" />,
      footer: [
        <div key="footer" className="pt-4 flex justify-between">
          <Button
            key="back"
            className="custom-secondary-button"
            onClick={destroyAll}
          >
            Cancel
          </Button>
          <Button
            key="submit"
            type="default"
            className="custom-primary-button"
            loading={isLoading}
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

  const card = (
    <Card
      bordered
      hoverable
      style={{ width: 240 }}
      cover={
        isFetching || isLoading ? (
          <Skeleton.Image style={{ width: 240 }} />
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
      actions={
        showActions
          ? [
              <EditOutlined
                key="edit"
                rev="edit"
                onClick={() =>
                  router.push(`/profile/activity/businesses/${business.id}`)
                }
              />,
              <DeleteOutlined
                key="delete"
                rev="delete"
                onClick={showConfirm}
              />,
            ]
          : []
      }
    >
      <Card.Meta
        className="clamp-description"
        title={business.name}
        description={showActions ? false : business.description}
      />
    </Card>
  );

  if (showActions) {
    return card;
  }

  return <Link href={`/businesses/${business.id}`}>{card}</Link>;
};
