import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Skeleton } from "antd";
import Image from "next/image";
import { useCallback, useMemo, useState, type FC } from "react";

import { LocationsSelect, PopConfirmDelete } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type {
  BusinessArea,
  Country,
  LocationFormState,
  LocationSelectState,
  LocationType,
} from "types";

const initialState: LocationFormState = {
  country: { isLoading: false },
  region: { isLoading: false },
  division: { isLoading: false },
  city: { isLoading: false },
};

type EditAreasProps = {
  businessId: string;
  onSuccess?: () => void;
};

export const EditAreas: FC<EditAreasProps> = ({ businessId, onSuccess }) => {
  const [locationState, setLocationState] =
    useState<LocationFormState>(initialState);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

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

  const isLoading = useMemo(
    () =>
      isLoadingRead || isLoadingCreate || isLoadingDelete || isLoadingLocations,
    [isLoadingRead, isLoadingCreate, isLoadingDelete, isLoadingLocations]
  );

  const contextHolder = useErrorToaster(
    isErrorRead || isErrorCreate || isErrorDelete,
    isSuccessRead || isSuccessCreate || isSuccessDelete,
    (errorRead || errorCreate || errorDelete)?.message ?? "Error updating areas"
  );

  const setSelectedFormState = useCallback(
    (type: LocationType, payload: LocationSelectState) =>
      setLocationState((prevState) => ({ ...prevState, [type]: payload })),
    [setLocationState]
  );

  const handleSave = () =>
    !!locationState.country.id &&
    updateBusinessAreas({
      businessId,
      countryId: locationState.country.id,
      regionId: locationState.region?.id,
      divisionId: locationState.division?.id,
      cityId: locationState.city?.id,
    });

  const handleDelete = (areaId: string) =>
    deleteBusinessArea({ businessId, areaId });

  return (
    <section className="w-full pt-12">
      <h4 className="section-title">Areas</h4>
      {contextHolder}
      <div className="flex flex-col gap-3">
        <LocationsSelect
          locationsState={locationState}
          emitSelectedState={setSelectedFormState}
          emitIsLoadingState={setIsLoadingLocations}
        />
      </div>
      <Button
        tabIndex={0}
        size="large"
        type="default"
        htmlType="button"
        loading={isLoading}
        disabled={!businessId || isLoading || !locationState.country.id}
        className="custom-primary-button w-full my-3"
        onClick={handleSave}
      >
        Create
      </Button>
      <Skeleton loading={isLoadingRead}>
        {businessAreas?.map((area: BusinessArea) => {
          const country = area.expand?.country as Country;
          const region = area.expand?.region;
          const division = area.expand?.division;
          const city = area.expand?.city;

          return (
            <div key={area.id} className="pt-3 w-full flex justify-between">
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
              </div>
              <PopConfirmDelete
                title="Delete area"
                description="Are you sure to delete this area?"
                isLoading={isLoading}
                onDelete={() => handleDelete(area.id)}
              />
            </div>
          );
        })}
      </Skeleton>
    </section>
  );
};
