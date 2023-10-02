import type { NextPage } from "next";
import { ProfileBusinessesHeader } from "./(profileBusinessesHeader)";
import { ProfileBusinessesList } from "./(profileBusinessesList)";

const ProfileBusinessesPage: NextPage = () => (
  <section className="w-full flex flex-col">
    <ProfileBusinessesHeader />
    <ProfileBusinessesList />
  </section>
);

export default ProfileBusinessesPage;
