import { FC } from "react";

import type { BusinessService, Service, ServiceCategory } from "../../types";

type ServicesSectionProps = { businessServices: BusinessService[] };

export const ServicesSection: FC<ServicesSectionProps> = ({
  businessServices,
}) => (
  <section className="my-6">
    <h4 className="text-lg font-bold text-neutral-content mb-6 border-b-2 border-slate-300">
      Services
    </h4>
    {Object.entries(
      businessServices.reduce((acc, curr) => {
        const service = curr.expand.service as Service;
        const category = service.expand.category as ServiceCategory;
        return {
          ...acc,
          [category.name]: [...(acc[category.name] ?? []), service],
        };
      }, {} as Record<string, Service[]>)
    ).map(([categoryName, services]) => (
      <div className="mb-6" key={categoryName}>
        <h5 className="font-bold text-primary">{categoryName}</h5>
        {services.map((service) => (
          <div className="ml-3 mt-3" key={service.id}>
            <h6 className="font-bold underline mb-1">{service.name}</h6>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    ))}
  </section>
);
