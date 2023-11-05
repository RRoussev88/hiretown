import { authRouter } from "./authentication";
import { businessRouter } from "./business";
import { imagesRouter } from "./images";
import { locationsRouter } from "./locations";
import { profileRouter } from "./profile";
import { servicesRouter } from "./services";
import { socialLinksRouter } from "./socialLinks";

import { mergeRouters } from "../trpc";

export const appRouter = mergeRouters(
  authRouter,
  businessRouter,
  imagesRouter,
  locationsRouter,
  servicesRouter,
  profileRouter,
  socialLinksRouter
);

// export type definition of API
export type AppRouter = typeof appRouter;
