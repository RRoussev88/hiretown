import { FC } from "react";

import type { OpeningHours } from "../../types";
import { weekDays } from "../../utils";

type OpeningHoursSectionProps = { openingHours: OpeningHours };

export const OpeningHoursSection: FC<OpeningHoursSectionProps> = ({
  openingHours,
}) => (
  <section className="border border-slate-300 shadow rounded-md p-6 my-6 table w-full">
    <h4 className="text-lg font-bold text-neutral-content mb-6">
      Opening hours
    </h4>
    {weekDays.map((day) => (
      <p className="h-10 table-row" key={day}>
        <span className="table-cell align-bottom border-b-2 border-slate-300">
          {day}
        </span>
        <span className="table-cell align-bottom border-b-2 border-slate-300">
          {openingHours[day].length === 2 && openingHours[day].every(Boolean)
            ? `${openingHours[day][0]} - ${openingHours[day][1]}`
            : "Closed"}
        </span>
      </p>
    ))}
  </section>
);
