import { Button, Transfer } from "antd";
import { type FC, useState } from "react";

import { CustomSelect } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { Service } from "types";

type EditServicesProps = {
  businessId: string;
  services: Service[];
  onSuccess?: () => void;
};

export const EditServices: FC<EditServicesProps> = ({
  businessId,
  services,
  onSuccess,
}) => {
  const businessServiceIds = services.map((service) => service.id);
  const { data: serviceOptions } = trpc.services.useQuery(
    {},
    { enabled: !!businessId }
  );

  const [serviceCategoryId, setServiceCategoryId] = useState<string | null>(
    null
  );
  const [businessServiceCategoryId, setBusinessServiceCategoryId] = useState<
    string | null
  >(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>(businessServiceIds);

  const {
    mutate: updateBusinessServices,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.updateBusinessServices.useMutation({ onSuccess });

  const hasChanges =
    JSON.stringify(businessServiceIds.sort()) !==
    JSON.stringify(targetKeys.sort());

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error saving services"
  );

  const dataSource = [
    ...services.filter(
      (service) =>
        !businessServiceCategoryId ||
        service.category === businessServiceCategoryId
    ),
    ...(serviceOptions?.filter(
      (service) =>
        !businessServiceIds.includes(service.id) &&
        (!serviceCategoryId || service.category === serviceCategoryId)
    ) ?? []),
  ];

  const clearChanges = () => {
    setSelectedKeys([]);
    setTargetKeys(businessServiceIds);
  };

  const handleSave = () =>
    updateBusinessServices({ businessId, serviceIds: targetKeys });

  const onChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  return (
    <section className="w-full pt-12">
      <h4 className="section-title">Services</h4>
      {contextHolder}
      <div className="flex justify-between mb-2">
        <CustomSelect
          selectorName="Service Categories"
          optionsName="serviceCategories"
          emitSelected={(category) => setServiceCategoryId(category?.id)}
          className="w-[calc(50%-20px)]"
        />
        <CustomSelect
          selectorName="Business Service Categories"
          optionsName="serviceCategories"
          emitSelected={(category) =>
            setBusinessServiceCategoryId(category?.id)
          }
          className="w-[calc(50%-20px)]"
        />
      </div>
      <Transfer
        oneWay
        showSearch
        listStyle={{ width: "calc(50% - 20px)", height: 360 }}
        rowKey={(record) => record.id}
        dataSource={dataSource}
        titles={["Options", "Business"]}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={onChange}
        onSelectChange={onSelectChange}
        render={(service) => service.name}
      />
      <div className="mt-4 flex max-sm:flex-wrap gap-x-3">
        <Button
          size="large"
          type="default"
          loading={isLoading}
          disabled={!businessId || isLoading || !hasChanges}
          className="custom-primary-button bg-accent max-sm:mb-4 max-sm:flex-1"
          onClick={clearChanges}
        >
          Clear Changes
        </Button>
        <Button
          size="large"
          type="default"
          htmlType="submit"
          loading={isLoading}
          disabled={!businessId || isLoading || !hasChanges}
          className="custom-primary-button flex-1"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </section>
  );
};
