import { ArrowRightOutlined } from "@ant-design/icons";
import { List } from "antd";
import { useErrorToaster } from "hooks";
import { type FC } from "react";
import Image from "next/image";

import { PopConfirmDelete } from "@/components/index";
import { trpc } from "trpc";
import { BusinessArea, Country } from "types";

type AreaListItemProps = {
  area: BusinessArea;
  businessId: string;
  onSuccess?: () => void;
};

export const AreaListItem: FC<AreaListItemProps> = ({
  area,
  businessId,
  onSuccess,
}) => {
  const {
    mutate: deleteBusinessArea,
    isLoading,
    isSuccess,
    isError,
    error,
  } = trpc.deleteBusinessArea.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error deleting areas"
  );

  const country = area.expand?.country as Country;
  const region = area.expand?.region;
  const division = area.expand?.division;
  const city = area.expand?.city;

  return (
    <List.Item
      actions={[
        <PopConfirmDelete
          key={`area-${area.id}`}
          title="Delete area"
          description="Are you sure to delete this area?"
          isLoading={isLoading}
          onDelete={() => deleteBusinessArea({ businessId, areaId: area.id })}
        />,
      ]}
    >
      {contextHolder}
      <List.Item.Meta
        avatar={
          <Image
            src={country.flagImageUri}
            alt={country.name}
            className="inline-block mr-3 w-5 h-5"
            width={20}
            height={20}
          />
        }
        title={
          <p>
            {country.name}
            {!!region && (
              <span>
                <ArrowRightOutlined rev="" className="mx-3" />
                {region.name}
              </span>
            )}
            {!!division && (
              <span>
                <ArrowRightOutlined rev="" className="mx-3" />
                {division.name}
              </span>
            )}
            {!!city && (
              <span>
                <ArrowRightOutlined rev="" className="mx-3" />
                {city.name}
              </span>
            )}
          </p>
        }
      />
    </List.Item>
  );
};
