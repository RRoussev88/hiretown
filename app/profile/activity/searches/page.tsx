import type { NextPage } from "next";
import { BusinessSearchesList } from "./(businessSearchesList)";

const ProfileSearchesPage: NextPage = () => (
  <section className="w-full flex flex-col text-primary-content">
    <p className="mb-5 text-2xl font-semibold">Search History</p>
    <BusinessSearchesList />
  </section>
);

export default ProfileSearchesPage;
