import { Transfer } from "antd";
import { useState, type FC } from "react";

import { CustomSelect, SaveAndClearButtons } from "@/components/.";
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
    <section className="w-full pt-12 flex flex-col gap-3">
      <h4 className="section-title">Services</h4>
      {contextHolder}
      <div className="flex justify-between">
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
      <SaveAndClearButtons
        isLoading={isLoading}
        isClearDisabled={!businessId || isLoading || !hasChanges}
        isSaveDisabled={!businessId || isLoading || !hasChanges}
        onClear={clearChanges}
        onSave={handleSave}
      />
    </section>
  );
};
