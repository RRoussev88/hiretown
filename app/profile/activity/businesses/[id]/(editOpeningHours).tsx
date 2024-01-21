import { type FC, useMemo, useState } from "react";

import { HoursInputRow, SaveAndClearButtons } from "@/components/.";
import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { OpeningHours } from "types";
import { defaultOpeningHours, weekDays } from "utils";

type EditOpeningHoursProps = {
  businessId: string;
  openingHours?: OpeningHours;
  onSuccess?: () => void;
};

export const EditOpeningHours: FC<EditOpeningHoursProps> = ({
  businessId,
  openingHours,
  onSuccess,
}) => {
  const initialHours = openingHours ?? defaultOpeningHours;
  const [openingHoursState, setHoursState] = useState(initialHours);

  const hasChanges = useMemo(
    () =>
      Object.entries(openingHoursState).some(
        ([day, [opening, closing]]) =>
          initialHours?.[day as keyof OpeningHours][0] !== opening ||
          initialHours?.[day as keyof OpeningHours][1] !== closing
      ),
    [initialHours, openingHoursState]
  );

  const {
    mutate: updateBusiness,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.updateBusiness.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error saving opening hours"
  );

  const clearChanges = () => setHoursState(initialHours);

  const handleSave = () =>
    updateBusiness({
      businessId,
      openingHours: openingHoursState,
    });

  return (
    <section className="w-full pt-12 flex flex-col gap-3">
      <h4 className="section-title">Opening hours</h4>
      {contextHolder}
      <div>
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
      </div>
      <SaveAndClearButtons
        isLoading={isLoading}
        isClearDisabled={!businessId || !hasChanges}
        isSaveDisabled={!businessId || !hasChanges}
        onClear={clearChanges}
        onSave={handleSave}
      />
    </section>
  );
};
