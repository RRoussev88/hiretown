import type { NextPage } from "next";
import Image from "next/image";

import { SearchForm } from "components";
import backgroundImage from "public/trimming.jpeg";

const Home: NextPage = () => (
  <article className="grid w-full place-items-center min-h-full">
    <Image
      className="w-full h-auto bg-cover bg-no-repeat z-0 brightness-50 object-cover"
      src={backgroundImage}
      placeholder="blur"
      alt="Background"
      sizes="100vw"
      priority
      fill
    />
    <div className="text-center text-primary p-0 m-6 sm:m-12 z-10">
      <h1 className="mb-5 text-2xl sm:text-5xl font-bold">
        Get the job around your property done
      </h1>
      <p className="mb-5 text-secondary text-xl sm:text-2xl font-semibold">
        Start by searching a Hire near you
      </p>
      <SearchForm />
    </div>
  </article>
);

export default Home;
