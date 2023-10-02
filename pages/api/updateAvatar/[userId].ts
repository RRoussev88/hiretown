import { NextApiRequest, NextApiResponse } from "next";
import type Pocketbase from "pocketbase";
import { initPocketBase } from "server/pocketbase";
import type { User } from "types";
import { DataCollections } from "utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const base64Image = req.body.avatarBase64.split(";base64,").pop();
  const buffer = Buffer.from(base64Image, "base64");
  const avatar = new Blob([buffer], { type: req.body.avatarType });

  const formData = new FormData();
  formData.append("avatar", avatar, req.body.avatarName);

  const pbClient: Pocketbase = await initPocketBase(req, res);
  try {
    const user: User = await pbClient
      .collection(DataCollections.USERS)
      .update<User>(req.query.userId as string, formData);

    res.status(200).json(user);
  } catch (error) {
    res.status((error as any).httpCode || 400).json({
      isError: true,
      message: (error as any)?.response?.message ?? "Avatar upload failed",
    });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
