import { FC } from "react";
import Image from "next/image";
import { Twitter, YouTube, Facebook } from "../SvgIcons";

export const Footer: FC = () => (
  <footer className="custom-footer">
    <div className="items-center">
      <Image src="/brandIcon.png" alt="Brand image" width={36} height={36} />
      <p>
        Copyright&nbsp;&copy;&nbsp;{new Date().getFullYear()} - All right
        reserved
      </p>
    </div>
    <div className="md:place-self-center md:justify-self-end">
      <a>
        <Twitter />
      </a>
      <a>
        <YouTube />
      </a>
      <a>
        <Facebook />
      </a>
    </div>
  </footer>
);
