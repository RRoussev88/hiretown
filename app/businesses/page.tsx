import { BusinessesList, SearchForm } from "components";
import { BusinessesFilterParams } from "types";

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: BusinessesFilterParams;
}) {
  return (
    <article className="grid">
      <section className="mb-6 sm:mb-12">
        <SearchForm />
      </section>
      <BusinessesList searchParams={searchParams} />
    </article>
  );
}
