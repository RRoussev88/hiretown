import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, List } from "antd";
import Image from "next/image";
import { useCallback, useMemo, useState, type FC } from "react";

import { LocationsSelect, PopConfirmDelete } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type {
  Country,
  LocationFormState,
  LocationSelectState,
  LocationType,
} from "types";
import { AreaListItem } from "./(areaListItem)";

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

  const isLoading = useMemo(
    () => isLoadingRead || isLoadingCreate || isLoadingLocations,
    [isLoadingRead, isLoadingCreate, isLoadingLocations]
  );

  const contextHolder = useErrorToaster(
    isErrorRead || isErrorCreate,
    isSuccessRead || isSuccessCreate,
    (errorRead || errorCreate)?.message ?? "Error updating areas"
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

  return (
    <section className="w-full pt-12 flex flex-col gap-3">
      <h4 className="section-title">Areas</h4>
      {contextHolder}
      <LocationsSelect
        locationsState={locationState}
        emitSelectedState={setSelectedFormState}
        emitIsLoadingState={setIsLoadingLocations}
      />
      <div className="flex justify-end">
        <Button
          tabIndex={0}
          size="large"
          type="default"
          htmlType="button"
          loading={isLoading}
          disabled={!businessId || isLoading || !locationState.country.id}
          className="custom-primary-button w-full sm:w-40"
          onClick={handleSave}
        >
          Create
        </Button>
      </div>
      <List
        bordered
        itemLayout="horizontal"
        locale={{ emptyText: "No areas created yet" }}
        dataSource={businessAreas}
        renderItem={(area) => (
          <AreaListItem
            businessId={businessId}
            area={area}
            onSuccess={onSuccess}
          />
        )}
      />
    </section>
  );
};
