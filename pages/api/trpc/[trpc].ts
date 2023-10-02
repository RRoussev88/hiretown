import { createNextApiHandler } from "@trpc/server/adapters/next";
import { NextApiRequest, NextApiResponse } from "next";

import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";
import { notBatchedRequestPaths } from "utils";

const nextApiHandler = createNextApiHandler({
  router: appRouter,
  createContext,
  responseMeta({ ctx, type, errors }) {
    const { pathname } = new URL(ctx?.req.url ?? "", "http://www.dummy.com");
    if (notBatchedRequestPaths.some((path) => pathname.includes(path))) {
      return {};
    }

    if (!errors.length && type === "query") {
      // cache request for 1 day + revalidate once every second
      const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
      return {
        headers: {
          "cache-control": `max-age=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
        },
      };
    }

    return {};
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use the response object to enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  return nextApiHandler(req, res);
}
