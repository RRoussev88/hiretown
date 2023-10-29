import { FC } from "react";

import type { Offer, UnitOfMeasure } from "../../types";

type OffersSectionProps = { offers: Offer[] };

export const OffersSection: FC<OffersSectionProps> = ({ offers }) => (
  <section className="my-6">
    <h4 className="text-lg font-bold text-primary mb-6 border-b-2 border-slate-300">
      Special Offers
    </h4>
    {offers.map((offer) => (
      <div key={offer.id} className="mb-6 flex justify-between flex-wrap gap-3">
        <div>
          <h6 className="font-bold text-accent underline mb-1">{offer.name}</h6>
          <p>{offer.description}</p>
        </div>
        <div>
          <p>
            Price: {offer.price}&nbsp;{offer.currency}
          </p>
          <p>for {(offer.expand?.unitOfMeasure as UnitOfMeasure).name}</p>
        </div>
      </div>
    ))}
  </section>
);
