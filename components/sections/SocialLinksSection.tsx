import { FC } from "react";
import Link from "next/link";

import { iconsMap } from "..";
import { SocialLink } from "types";

type SocialLinksSectionProps = { businessLinks: SocialLink[] };

export const SocialLinksSection: FC<SocialLinksSectionProps> = ({
  businessLinks,
}) => (
  <section className="border border-slate-300 shadow rounded-md p-6 w-full">
    <h4 className="text-lg font-bold mb-6 text-primary">Links</h4>
    {businessLinks.map((socialLink) => (
      <p className="mb-6 truncate" key={socialLink.id}>
        {iconsMap[socialLink.expand.platform.key] ??
          socialLink.expand.platform.title.slice(0, 5).toUpperCase() + ":"}
        <Link
          className="link ml-2 visited:text-neutral-content underline underline-offset-4 hover:opacity-60"
          href={socialLink.link}
        >
          {socialLink.link}
        </Link>
      </p>
    ))}
  </section>
);
