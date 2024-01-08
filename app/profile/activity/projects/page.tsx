import type { NextPage } from "next";
import { ProfileProjectsList } from "./(profileProjectsList)";

const ProfileProjectsPage: NextPage = () => (
  <section className="w-full flex flex-col text-primary-content">
    <ProfileProjectsList />
  </section>
);

export default ProfileProjectsPage;
