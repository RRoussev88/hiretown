import "../styles/globals.css";
import type { NextPage } from "next";
import Image from "next/image";

import { Footer } from "components";
import backgroundImage from "public/auto_repair.jpeg";

const NotFound: NextPage = () => (
  <main
    data-theme="bumblebee"
    className="bg-base-200 min-h-screen flex flex-col"
  >
    <Image
      className="w-full h-auto bg-cover bg-no-repeat z-0 brightness-50 object-cover"
      src={backgroundImage}
      placeholder="blur"
      alt="Background"
      sizes="100vw"
      priority
      fill
    />
    <div className="flex flex-col flex-auto shrink-0 items-center justify-center mx-auto z-10">
      <div className="p-3 sm:p-6 max-w-md text-center">
        <h1 className="text-xl sm:text-5xl font-bold text-primary">
          Page not found
        </h1>
        <p className="py-6 text-xs sm:text-base text-accent-focus break-normal">
          The page you are trying to acces doesn&apos;t exist.
        </p>
        <a href="/" className="custom-button custom-primary-button">
          Go Home
        </a>
      </div>
    </div>
    <Footer />
  </main>
);

export default NotFound;
