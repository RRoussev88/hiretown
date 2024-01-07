import type { FC } from "react";

// TODO: Change with the correct approach recommended by NextJS docs
// https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#modifying-head
export const BaseHead: FC<{ title: string }> = ({ title }) => (
  <>
    <title>{title}</title>
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta name="description" content="Hiretown app" />
    <link rel="icon" href="/favicon.ico" />
  </>
);
