import { ArrowRightOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Skeleton } from "antd";
import Image from "next/image";
import { useState, type FC } from "react";

import { CustomSelect } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { BusinessArea, City, Country, Division, Region } from "types";

type EditAreasProps = {
  businessId: string;
  onSuccess?: () => void;
};

export const EditAreas: FC<EditAreasProps> = ({ businessId, onSuccess }) => {
  const [country, setCountry] = useState<Country | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [division, setDivision] = useState<Division | null>(null);
  const [city, setCity] = useState<City | null>(null);

  const {
    data: businessAreas,
    isLoading: isLoadingRead,
    isSuccess: isSuccessRead,
    isError: isErrorRead,
    error: errorRead,
  } = trpc.businessAreas.useQuery({ businessId }, { enabled: !!businessId });

  const {
    mutate: updateBusinessAreas,
    isLoading: isLoadingCreate,
    isSuccess: isSuccessCreate,
    isError: isErrorCreate,
    error: errorCreate,
  } = trpc.createBusinessArea.useMutation({ onSuccess });

  const {
    mutate: deleteBusinessArea,
    isLoading: isLoadingDelete,
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
    error: errorDelete,
  } = trpc.deleteBusinessArea.useMutation({ onSuccess });

  const isLoading = isLoadingRead || isLoadingCreate || isLoadingDelete;

  const contextHolder = useErrorToaster(
    isErrorRead || isErrorCreate || isErrorDelete,
    isSuccessRead || isSuccessCreate || isSuccessDelete,
    (errorRead || errorCreate || errorDelete)?.message ?? "Error updating areas"
  );

  const handleSave = () =>
    country &&
    updateBusinessAreas({
      businessId,
      countryId: country.id,
      regionId: region?.id,
      divisionId: division?.id,
      cityId: city?.id,
    });

  const handleDelete = (areaId: string) =>
    deleteBusinessArea({ businessId, areaId });

  return (
    <section className="w-full sm:w-9/12 mx-auto my-6">
      <h4 className="text-lg font-bold text-neutral-content my-6 border-b-2 border-slate-300">
        Areas
      </h4>
      {contextHolder}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <CustomSelect
            selectorName="Countries"
            optionsName="countries"
            emitSelected={setCountry}
            className="w-full sm:w-1/2"
          />
          <CustomSelect
            selectorName="Regions"
            optionsName="regions"
            emitSelected={setRegion}
            className="w-full sm:w-1/2"
            filter={{ countryName: country?.name }}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <CustomSelect
            selectorName="Divisions"
            optionsName="divisions"
            emitSelected={setDivision}
            className="w-full sm:w-1/2"
            filter={{ countryName: country?.name, regionName: region?.name }}
          />
          <CustomSelect
            selectorName="Cities"
            optionsName="cities"
            emitSelected={setCity}
            className="w-full sm:w-1/2"
            filter={{
              countryName: country?.name,
              regionName: region?.name,
              divisionName: division?.name,
            }}
          />
        </div>
      </div>
      <Button
        size="large"
        type="default"
        htmlType="button"
        loading={isLoading}
        disabled={!businessId || isLoading || !country}
        className="custom-primary-button w-full my-3"
        onClick={handleSave}
      >
        Create
      </Button>
      <Skeleton loading={isLoadingRead}>
        {businessAreas?.items.map((area: BusinessArea) => {
          const country = area.expand.country as Country;
          const region = area.expand.region as Region;
          const division = area.expand.division as Division;
          const city = area.expand.city as City;

          return (
            <div key={area.id} className="my-3 w-full flex justify-between">
              <div>
                <Image
                  src={country.flagImageUri}
                  alt={country.name}
                  className="inline-block mr-3"
                  width={20}
                  height={20}
                />
                {country.name}
                {!!region && (
                  <span>
                    <ArrowRightOutlined rev className="mx-3" />
                    {region.name}
                  </span>
                )}
                {!!division && (
                  <span>
                    <ArrowRightOutlined rev className="mx-3" />
                    {division.name}
                  </span>
                )}
                {!!city && (
                  <span>
                    <ArrowRightOutlined rev className="mx-3" />
                    {city.name}
                  </span>
                )}
              </div>
              <Popconfirm
                title="Delete area"
                description="Are you sure to delete this area?"
                onConfirm={() => handleDelete(area.id)}
                okText="Yes"
                cancelText="No"
                disabled={isLoading}
              >
                <Button
                  size="large"
                  type="default"
                  htmlType="button"
                  loading={isLoadingDelete}
                  disabled={isLoading}
                  className="custom-button bg-error"
                >
                  {!isLoadingDelete && <DeleteOutlined rev />}
                </Button>
              </Popconfirm>
            </div>
          );
        })}
      </Skeleton>
    </section>
  );
};
