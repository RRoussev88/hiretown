import { List } from "antd";
import { type FC } from "react";

import { PopConfirmDelete, iconsMap } from "@/components/index";
import { useErrorToaster } from "hooks";
import Link from "next/link";
import { trpc } from "trpc";
import { SocialLink } from "types";

type PlatformLinkListItemProps = {
  link: SocialLink;
  businessId: string;
  onSuccess?: () => void;
};

export const PlatformLinkListItem: FC<PlatformLinkListItemProps> = ({
  link,
  businessId,
  onSuccess,
}) => {
  const {
    mutate: deleteLink,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.deleteLink.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error deleting link"
  );

  return (
    <List.Item
      actions={[
        <PopConfirmDelete
          key={`del-${link.id}`}
          title="Delete service"
          description="Are you sure to delete this link?"
          isLoading={isLoading}
          onDelete={() => deleteLink({ businessId, linkId: link.id })}
        />,
      ]}
    >
      {contextHolder}
      <List.Item.Meta
        avatar={
          iconsMap[link.expand.platform.key] ??
          link.expand.platform.title.slice(0, 5).toUpperCase() + ":"
        }
        title={
          <Link
            className="link ml-2 visited:text-neutral-content underline underline-offset-4 hover:opacity-60"
            href={link.link}
          >
            {link.link}
          </Link>
        }
      />
    </List.Item>
  );
};
