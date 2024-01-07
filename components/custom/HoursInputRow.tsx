"use client";
import { TimePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { FC } from "react";

import { OpeningHours } from "types";

type HoursInputRowProps = {
  day: keyof OpeningHours;
  hoursState: [string, string];
  setHoursState: (timeString: [string, string]) => void;
};

export const HoursInputRow: FC<HoursInputRowProps> = ({
  day,
  hoursState,
  setHoursState,
}) => (
  <div className="h-10 w-full flex flex-wrap sm:flex-nowrap items-end">
    <span className="align-bottom border-b-2 border-slate-300 text-slate-500 flex-1">
      {day}
    </span>
    <div className="align-bottom border-b-2 border-slate-300 flex-1">
      <TimePicker.RangePicker
        size="large"
        className="text-slate-500 w-full"
        format="HH:mm"
        placeholder={["Closed", ""]}
        value={
          hoursState.map((time) => (time ? dayjs(time, "HH-mm") : null)) as [
            Dayjs,
            Dayjs
          ]
        }
        onChange={(_, timeString) => setHoursState(timeString)}
      />
    </div>
  </div>
);
