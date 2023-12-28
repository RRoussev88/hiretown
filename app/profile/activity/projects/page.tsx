import type { NextPage } from "next";
import { ProfileProjectsHeader } from "./(profileProjectsHeader)";
import { ProfileProjectsList } from "./(profileProjectsList)";

const ProfileProjectsPage: NextPage = () => (
  <section className="w-full flex flex-col text-primary-content">
    <ProfileProjectsHeader />
    <ProfileProjectsList />
  </section>
);

export default ProfileProjectsPage;
