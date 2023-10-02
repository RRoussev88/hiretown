import Link from "next/link";
import { FC } from "react";

import { AtSign, Globe, MapMarker, Phone } from "..";
import type { Business } from "../../types";

type ContactsSectionProps = { business: Business };

export const ContactsSection: FC<ContactsSectionProps> = ({ business }) => (
  <section className="my-6">
    <h4 className="text-lg font-bold text-neutral-content mb-6 border-b-2 border-slate-300">
      Contacts
    </h4>
    {!!business.address && (
      <p className="mb-6">
        <MapMarker />
        <span className="ml-2">{business.address}</span>
      </p>
    )}
    {!!business.contactEmail && (
      <p className="mb-6">
        <AtSign />
        <Link className="link ml-2" href={`mailto:${business.contactEmail}`}>
          {business.contactEmail}
        </Link>
      </p>
    )}
    {!!business.contactPhone && (
      <p className="mb-6">
        <Phone />
        <Link className="link ml-2" href={`tel:${business.contactPhone}`}>
          {business.contactPhone}
        </Link>
      </p>
    )}
    {!!business.contactWebsite && (
      <p className="mb-6">
        <Globe />
        <Link className="link ml-2" href={business.contactWebsite}>
          {business.contactWebsite}
        </Link>
      </p>
    )}
  </section>
);
