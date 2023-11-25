import { ArrowRightOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Skeleton } from "antd";
import Image from "next/image";
import { type FC, useCallback, useReducer, useMemo } from "react";

import { LocationsSelect } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type {
  BusinessArea,
  City,
  Country,
  Division,
  LocationSelectState,
  LocationType,
  Region,
} from "types";

type EditAreasState = {
  [key in LocationType]: LocationSelectState;
};

const initialState: EditAreasState = {
  country: { isLoading: false },
  region: { isLoading: false },
  division: { isLoading: false },
  city: { isLoading: false },
};

const stateReducer = (
  state: EditAreasState,
  action: { type: keyof EditAreasState; payload: LocationSelectState }
) => ({ ...state, [action.type]: action.payload });

type EditAreasProps = {
  businessId: string;
  onSuccess?: () => void;
};

export const EditAreas: FC<EditAreasProps> = ({ businessId, onSuccess }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

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
      isLoadingRead ||
      isLoadingCreate ||
      isLoadingDelete ||
      state.country.isLoading ||
      state.region.isLoading ||
      state.division.isLoading ||
      state.city.isLoading,
    [
      isLoadingRead,
      isLoadingCreate,
      isLoadingDelete,
      state.country.isLoading,
      state.region.isLoading,
      state.division.isLoading,
      state.city.isLoading,
    ]
  );

  const contextHolder = useErrorToaster(
    isErrorRead || isErrorCreate || isErrorDelete,
    isSuccessRead || isSuccessCreate || isSuccessDelete,
    (errorRead || errorCreate || errorDelete)?.message ?? "Error updating areas"
  );

  const setSelectedFormState = useCallback(
    (type: LocationType, payload: LocationSelectState) =>
      dispatch({ type, payload }),
    [dispatch]
  );

  const handleSave = () =>
    state.country.id &&
    updateBusinessAreas({
      businessId,
      countryId: state.country.id,
      regionId: state.region?.id,
      divisionId: state.division?.id,
      cityId: state.city?.id,
    });

  const handleDelete = (areaId: string) =>
    deleteBusinessArea({ businessId, areaId });

  return (
    <section className="w-full pt-12">
      <h4 className="section-title">Areas</h4>
      {contextHolder}
      <div className="flex flex-col gap-3">
        <LocationsSelect emitSelectedState={setSelectedFormState} />
      </div>
      <Button
        size="large"
        type="default"
        htmlType="button"
        loading={isLoading}
        disabled={!businessId || isLoading || !state.country.id}
        className="custom-primary-button w-full my-3"
        onClick={handleSave}
      >
        Create
      </Button>
      <Skeleton loading={isLoadingRead}>
        {businessAreas?.map((area: BusinessArea) => {
          const country = area.expand.country as Country;
          const region = area.expand.region as Region;
          const division = area.expand.division as Division;
          const city = area.expand.city as City;

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
                  {!isLoadingDelete && <DeleteOutlined rev="" />}
                </Button>
              </Popconfirm>
            </div>
          );
        })}
      </Skeleton>
    </section>
  );
};
