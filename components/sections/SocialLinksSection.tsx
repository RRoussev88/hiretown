import { FC } from "react";
import Link from "next/link";

import { iconsMap } from "..";
import { SocialLink } from "types";

type SocialLinksSectionProps = { businessLinks: SocialLink[] };

export const SocialLinksSection: FC<SocialLinksSectionProps> = ({
  businessLinks,
}) => (
  <section className="border border-slate-300 shadow rounded-md p-6 my-6 table w-full">
    <h4 className="text-lg font-bold text-neutral-content mb-6">Links</h4>
    {businessLinks.map((socialLink) => (
      <p className="mb-6" key={socialLink.id}>
        {iconsMap[socialLink.expand.platform.key] ??
          socialLink.expand.platform.title.slice(0, 5).toUpperCase() + ":"}
        <Link className="link ml-2" href={socialLink.link}>
          {socialLink.link}
        </Link>
      </p>
    ))}
  </section>
);
