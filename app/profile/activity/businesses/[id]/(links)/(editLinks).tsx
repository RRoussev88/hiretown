import { Input, List, Select } from "antd";
import { useState, type FC } from "react";

import { SaveAndClearButtons } from "components";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { SelectOption, SocialLink } from "types";
import { PlatformLinkListItem } from "./(platformLinkListItem)";

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

  const contextHolder = useErrorToaster(
    isPlatformsError || isCreateError,
    isPlatformsSuccess || isCreateSuccess,
    (platformsError || createError)?.message ?? "Error saving links"
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
    <section className="w-full pt-12 flex flex-col gap-3">
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
      <SaveAndClearButtons
        isLoading={isLoadingCreate}
        isClearDisabled={!businessId || isLoadingPlatforms || !hasChanges}
        isSaveDisabled={
          !businessId || isLoadingPlatforms || !selectedPlatformId || !newLink
        }
        onClear={clearChanges}
        onSave={handleSave}
      />
      <List
        bordered
        itemLayout="horizontal"
        locale={{ emptyText: "No social media links created yet" }}
        dataSource={links}
        renderItem={(link) => (
          <PlatformLinkListItem
            businessId={businessId}
            link={link}
            onSuccess={onSuccess}
          />
        )}
      />
    </section>
  );
};
