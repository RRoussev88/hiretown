import type { NextPage } from "next";
import { type ReactNode } from "react";

import { MenuLinks } from "./(menuLinks)";
import { ProfileHeader } from "./(profileHeader)";

const Profile: NextPage<{ children: ReactNode }> = ({ children }) => (
  <section>
    <ProfileHeader />
    <div className="w-full flex gap-x-3 justify-center relative">
      <MenuLinks isInline />
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  </section>
);

export default Profile;
