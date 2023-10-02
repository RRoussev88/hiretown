"use client";
import { Select } from "antd";
import { type FC, useEffect, useState } from "react";

import { useFetchAndSelect } from "hooks";
import { RouterInputs, trpc } from "trpc";
import type { SelectOption } from "types";

type CustomSelectProps = {
  selectorName: string;
  optionsName: Exclude<keyof RouterInputs, "signin" | "signup">;
  filter?: object | null;
  allOption?: boolean;
  emitSelected?: (selectedItem: any) => void;
  className?: string;
};

export const CustomSelect: FC<CustomSelectProps> = ({
  selectorName,
  optionsName,
  filter,
  allOption,
  emitSelected,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isSuccess, refetch, selected, setSelected, contextHolder } =
    useFetchAndSelect<any, string>(
      (trpc[optionsName] as any).useQuery,
      "Service error: Failed to load server data",
      { ...filter, searchTerm }
    );

  const handleChange = (id: string) => {
    if (isSuccess) {
      const newSelected = data?.items.find((item) => item.id === id) ?? null;
      setSelected(newSelected);
      emitSelected?.(newSelected);
    }
  };

  const handleFilter = (input: string, option?: SelectOption) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleClear = () => {
    setSelected(null);
    setSearchTerm("");
  };

  useEffect(() => {
    refetch();
  }, [searchTerm, refetch]);

  const options: SelectOption[] =
    data?.items.map((item) => ({
      key: item.id,
      value: item.id,
      label: item.name,
    })) ?? [];

  if (allOption && !!data?.items.length) {
    options.unshift({
      key: `all-${selectorName.toLowerCase().replace(" ", "-")}`,
      value: null,
      label: `All ${selectorName}`,
    });
  }

  return (
    <div className={className}>
      {contextHolder}
      <Select
        allowClear
        showSearch
        size="large"
        className="w-full"
        placeholder={selectorName}
        filterOption={handleFilter}
        onChange={handleChange}
        onSearch={setSearchTerm}
        onClear={handleClear}
        options={options}
        value={selected?.id}
      />
    </div>
  );
};
