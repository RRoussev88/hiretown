import { BusinessesList, SearchForm } from "components";
import { BusinessesFilterParams } from "types";

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: BusinessesFilterParams;
}) {
  return (
    <article className="grid p-3 sm:p-6">
      <section className="mb-6 sm:mb-12">
        <SearchForm />
      </section>
      <BusinessesList searchParams={searchParams} />
    </article>
  );
}
