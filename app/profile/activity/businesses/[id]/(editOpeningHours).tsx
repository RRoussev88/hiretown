import { Button } from "antd";
import { type FC, useState } from "react";

import { HoursInputRow } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { OpeningHours } from "types";
import { weekDays } from "utils";

type EditOpeningHoursProps = {
  businessId: string;
  openingHours?: OpeningHours;
  onSuccess?: () => void;
};

const defaultOpeningHours: OpeningHours = {
  Monday: ["", ""],
  Tuesday: ["", ""],
  Wednesday: ["", ""],
  Thursday: ["", ""],
  Friday: ["", ""],
  Saturday: ["", ""],
  Sunday: ["", ""],
};

export const EditOpeningHours: FC<EditOpeningHoursProps> = ({
  businessId,
  openingHours,
  onSuccess,
}) => {
  const [openingHoursState, setHoursState] = useState(
    openingHours ?? defaultOpeningHours
  );

  const {
    mutate: updateBusiness,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.updateBusiness.useMutation({ onSuccess });

  const hasChanges = Object.entries(openingHoursState).some(
    ([day, [opening, closing]]) =>
      openingHours?.[day as keyof OpeningHours][0] !== opening ||
      openingHours?.[day as keyof OpeningHours][1] !== closing
  );

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error saving opening hours"
  );

  const clearChanges = () => setHoursState(openingHours ?? defaultOpeningHours);

  const handleSave = () =>
    updateBusiness({
      businessId,
      openingHours: openingHoursState,
    });

  return (
    <section className="w-full sm:w-9/12 mx-auto my-6">
      <h4 className="text-lg font-bold text-neutral-content my-6 border-b-2 border-slate-300">
        Opening hours
      </h4>
      {contextHolder}
      {weekDays.map((day) => (
        <HoursInputRow
          key={day}
          day={day}
          hoursState={openingHoursState[day]}
          setHoursState={(timeString) =>
            setHoursState((prevState) => ({
              ...prevState,
              [day]: timeString,
            }))
          }
        />
      ))}
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
