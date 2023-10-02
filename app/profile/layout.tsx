"use client";
import type { NextPage } from "next";
import { useState, type ReactNode } from "react";

import { MenuDrawer } from "./(menuDrawer)";
import { MenuLinks } from "./(menuLinks)";
import { ProfileHeader } from "./(profileHeader)";

const Profile: NextPage<{ children: ReactNode }> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <section>
      <ProfileHeader handleOpenDrawer={setIsDrawerOpen} />
      <div className="flex gap-x-3">
        <MenuLinks isInline />
        {children}
      </div>
      <MenuDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </section>
  );
};

export default Profile;
