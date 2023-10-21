"use client";
import { Select } from "antd";
import { FC } from "react";

type SelectItem = { id: string; name: string };

type SearchSelectProps = {
  label: string;
  data: SelectItem[];
  selected: SelectItem | null;
  setSelected: (name: string | null) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  disabled?: boolean;
  allOption?: boolean;
};

export const SearchSelect: FC<SearchSelectProps> = ({
  label,
  data,
  selected,
  setSelected,
  searchValue,
  setSearchValue,
  disabled,
  allOption,
}) => {
  const handleSearch = (value: string) =>
    setSearchValue?.(value.toLocaleLowerCase());

  const handleClear = () => {
    setSelected(null);
    setSearchValue("");
  };

  const options = data.map((item) => ({
    key: item.id,
    value: item.name,
    label: item.name,
  }));

  if (allOption && !!data.length) {
    options.unshift({
      key: `all-${label}`,
      value: "",
      label: `All ${label}`,
    });
  }

  return (
    <Select
      allowClear
      showSearch
      size="large"
      disabled={disabled}
      className="w-full"
      placeholder="Search to Select"
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      filterSort={(optionA, optionB) =>
        (optionA?.label ?? "")
          .toLowerCase()
          .localeCompare((optionB?.label ?? "").toLowerCase())
      }
      onChange={setSelected}
      onClear={handleClear}
      onSearch={handleSearch}
      options={options}
      value={selected?.name || searchValue || label}
    />
  );
};
