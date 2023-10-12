import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

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
        Welcome to&nbsp;<Link href="/">Hiretown</Link>
      </h1>
      <p className="mb-5">Get started by searching a Hire</p>
      <SearchForm />
    </div>
  </article>
);

export default Home;
