"use client";
import { MenuOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Image from "next/image";
import { useContext, useState, type FC } from "react";

import { AuthContext } from "context/AuthContext";
import { FILES_URL, StorageKeys } from "utils";
import { MenuDrawer } from "./(menuDrawer)";

export const ProfileHeader: FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { [StorageKeys.CURRENT_USER]: user, logoutUser } =
    useContext(AuthContext);

  const avatarAbbr = user?.name
    ? user.name
        .split(" ")
        .reduce((acc: string, curr: string) => `${acc}${curr[0]}`, "")
    : user?.email.split("@")[0].slice(0, 4).toUpperCase();

  return (
    <div className="mb-2 sm:mb-5 flex flex-row-reverse 2xl:flex-row gap-x-3">
      <div
        className="max-sm:hidden bg-neutral-focus text-neutral-content rounded-full w-24 h-24 
      border-solid border-2 border-primary flex justify-center items-center overflow-hidden"
      >
        {user?.avatar ? (
          <Image
            loader={({ src }) => src}
            src={`${FILES_URL}/${user.collectionId}/${user.id}/${user.avatar}?thumb=100x100`}
            alt="Avatar image"
            width={100}
            height={100}
            className="rounded-full"
          />
        ) : (
          <span className="text-3xl">{avatarAbbr}</span>
        )}
      </div>
      <div className="self-center text-primary-content">
        {!!user?.name && <h3 className="text-2xl">{user?.name}</h3>}
        <p className="text-base">{user?.email}</p>
        <Button
          type="default"
          className="custom-primary-button"
          size="large"
          onClick={logoutUser}
        >
          Logout
        </Button>
      </div>
      <Button
        type="default"
        className="grid content-center mr-auto 2xl:hidden"
        icon={<MenuOutlined rev="" style={{ fontSize: 24 }} />}
        size="large"
        onClick={() => setIsDrawerOpen((prevState) => !prevState)}
      />
      <MenuDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </div>
  );
};
