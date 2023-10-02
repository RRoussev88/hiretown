"use client";
// import { createTRPCNext } from "@trpc/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink, httpBatchLink, loggerLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { FC, PropsWithChildren, useState } from "react";
import superjson from "superjson";

import { type AppRouter } from "@/server/routers/_app";
import { notBatchedRequestPaths } from "utils";

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCReact<AppRouter>({
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});

export const TrpcClientProvider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // Uncomment below for console logger
        // loggerLink({
        //   enabled: (opts) =>
        //     process.env.NODE_ENV === "development" ||
        //     (opts.direction === "down" && opts.result instanceof Error),
        // }),
        splitLink({
          // Condition for batching the request
          condition: (op) => !notBatchedRequestPaths.includes(op.path),
          // when condition is false, use batching
          true: httpBatchLink({ url: `${getBaseUrl()}/api/trpc` }),
          // when condition is true, use normal request
          false: httpLink({ url: `${getBaseUrl()}/api/trpc` }),
        }),
      ],
      transformer: superjson,
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
