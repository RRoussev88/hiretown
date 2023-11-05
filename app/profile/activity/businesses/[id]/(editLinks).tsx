import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Popconfirm, Select } from "antd";
import Link from "next/link";
import { useState, type FC } from "react";

import { iconsMap } from "@/components/SvgIcons";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { SelectOption, SocialLink } from "types";

type EditLinksProps = {
  businessId: string;
  links: SocialLink[];
  onSuccess?: () => void;
};

export const EditLinks: FC<EditLinksProps> = ({
  businessId,
  links,
  onSuccess,
}) => {
  const {
    data: platforms,
    isLoading: isLoadingPlatforms,
    isError: isPlatformsError,
    isSuccess: isPlatformsSuccess,
    error: platformsError,
  } = trpc.platforms.useQuery();

  const [selectedPlatformId, setServicePlatformId] = useState<string | null>(
    null
  );
  const [newLink, setNewLink] = useState<string>("");

  const clearChanges = () => {
    setServicePlatformId(null);
    setNewLink("");
  };

  const {
    mutate: createLink,
    isLoading: isLoadingCreate,
    isError: isCreateError,
    isSuccess: isCreateSuccess,
    error: createError,
  } = trpc.createLink.useMutation({
    onSuccess: () => {
      clearChanges();
      onSuccess?.();
    },
  });

  const {
    mutate: deleteLink,
    isLoading: isLoadingDelete,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    error: deleteError,
  } = trpc.deleteLink.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isPlatformsError || isCreateError || isDeleteError,
    isPlatformsSuccess || isCreateSuccess || isDeleteSuccess,
    (platformsError || createError || deleteError)?.message ??
      "Error saving links"
  );

  const handleSave = () => {
    selectedPlatformId &&
      newLink &&
      createLink({
        businessId,
        link: newLink,
        platformId: selectedPlatformId,
        title: "",
      });
  };

  const hasChanges = !!selectedPlatformId || !!newLink;

  const platformOptions: SelectOption[] =
    platforms?.map((item) => ({
      key: item.id,
      value: item.id,
      label: item.title,
    })) ?? [];

  const handleFilter = (input: string, option?: SelectOption) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <section className="w-full pt-12">
      <h4 className="section-title">Links</h4>
      {contextHolder}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-1/2">
          <Select
            allowClear
            showSearch
            size="large"
            className="w-full"
            placeholder="Platform"
            onChange={setServicePlatformId}
            filterOption={handleFilter}
            options={platformOptions}
            value={selectedPlatformId}
          />
        </div>
        <div className="w-full sm:w-1/2">
          <Input
            aria-required
            className="w-full"
            size="large"
            type="url"
            name="link"
            placeholder="Link"
            value={newLink}
            onChange={(event) => setNewLink(event.target.value)}
          />
        </div>
      </div>
      {!!links.length &&
        links.map((link) => (
          <p className="pt-3 w-full flex justify-between" key={link.id}>
            <span className="truncate">
              {iconsMap[link.expand.platform.key] ??
                link.expand.platform.title.slice(0, 5).toUpperCase() + ":"}
              <Link
                className="link ml-2 visited:text-neutral-content underline underline-offset-4 hover:opacity-60"
                href={link.link}
              >
                {link.link}
              </Link>
            </span>
            <Popconfirm
              title="Delete link"
              description="Are you sure to delete this link?"
              onConfirm={() => deleteLink({ businessId, linkId: link.id })}
              okText="Yes"
              cancelText="No"
              disabled={isLoadingDelete}
            >
              <Button
                size="large"
                type="default"
                htmlType="button"
                loading={isLoadingDelete}
                className="custom-button bg-error"
              >
                {!isLoadingDelete && <DeleteOutlined rev="" />}
              </Button>
            </Popconfirm>
          </p>
        ))}
      <div className="mt-4 flex max-sm:flex-wrap gap-x-3">
        <Button
          size="large"
          type="default"
          loading={isLoadingCreate}
          disabled={!businessId || isLoadingPlatforms || !hasChanges}
          className="custom-primary-button bg-accent max-sm:mb-4 max-sm:flex-1"
          onClick={clearChanges}
        >
          Clear Changes
        </Button>
        <Button
          size="large"
          type="default"
          htmlType="submit"
          loading={isLoadingCreate}
          disabled={
            !businessId || isLoadingPlatforms || !selectedPlatformId || !newLink
          }
          className="custom-primary-button flex-1"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </section>
  );
};
