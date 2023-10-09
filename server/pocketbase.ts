import PocketBase from "pocketbase";
import { NextApiRequest, NextApiResponse } from "next";

import { BACKEND_URL, DataCollections } from "utils";

export const initPocketBase = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<PocketBase> => {
  const pbClient = new PocketBase(BACKEND_URL);

  pbClient.authStore.loadFromCookie(req?.headers?.cookie ?? "");

  pbClient.authStore.onChange(() => {
    res?.setHeader(
      "set-cookie",
      pbClient.authStore.exportToCookie({
        httpOnly: false,
        secure: process.env.NODE_ENV !== "development",
      })
    );
  });

  try {
    // get an up-to-date auth store state by verifying
    // and refreshing the loaded auth model (if any)
    if (pbClient.authStore.isValid) {
      await pbClient.collection(DataCollections.USERS).authRefresh();
    }
  } catch {
    pbClient.authStore.clear();
  }

  return pbClient;
};
