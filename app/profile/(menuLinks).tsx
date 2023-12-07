"use client";
import { Button } from "antd";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { type FC } from "react";

export const MenuLinks: FC<{ isInline?: boolean }> = ({ isInline }) => {
  const path = usePathname();

  return (
    <ul
      className={clsx(
        "absolute left-0 flex flex-col p-4 w-72 bg-base-100 text-base-content divide-y divide-y-reverse h-min",
        { "max-2xl:hidden rounded-lg shadow border border-slate-300": isInline }
      )}
    >
      <li />
      <li className="mt-2 text-base text-base-300 font-semibold">Activity</li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/activity/searches"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/activity/searches"
            ),
          })}
        >
          Search History
        </Button>
      </li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/activity/businesses"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/activity/businesses"
            ),
          })}
        >
          My Businesses
        </Button>
      </li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/activity/projects"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/activity/projects"
            ),
          })}
        >
          My Projects
        </Button>
      </li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/activity/messages"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/activity/messages"
            ),
          })}
        >
          Messages
        </Button>
      </li>
      <li className="mt-8 text-base text-base-300 font-semibold">Settings</li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/settings/overview"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/settings/overview"
            ),
          })}
        >
          Profile Overview
        </Button>
      </li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/settings/payment-methods"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/settings/payment-methods"
            ),
          })}
        >
          Payment Methods
        </Button>
      </li>
      <li>
        <Button
          tabIndex={0}
          type="text"
          size="large"
          href="/profile/settings/notifications"
          className={clsx("custom-menu-link", {
            "bg-primary font-semibold": path?.startsWith(
              "/profile/settings/notifications"
            ),
          })}
        >
          Notifications
        </Button>
      </li>
    </ul>
  );
};
