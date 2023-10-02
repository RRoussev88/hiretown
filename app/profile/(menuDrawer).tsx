"use client";
import { Drawer } from "antd";
import { Dispatch, SetStateAction, type FC } from "react";

import { MenuLinks } from "./(menuLinks)";

type MenuDrawerProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
};

export const MenuDrawer: FC<MenuDrawerProps> = ({
  isDrawerOpen,
  setIsDrawerOpen,
}) => (
  <Drawer
    title="Profile"
    placement="left"
    onClose={() => setIsDrawerOpen(false)}
    open={isDrawerOpen}
    key="drawer"
  >
    <MenuLinks />
  </Drawer>
);
