import type Pocketbase from "pocketbase";
import { type RecordAuthResponse } from "pocketbase";
import { z } from "zod";

import type { ImageUploadPayload, User } from "types";
import { APIError, DataCollections } from "utils";
import { procedure, protectedProcedure, router } from "../trpc";

const performSignin = async (
  pbClient: Pocketbase,
  email: string,
  password: string
) => {
  if (!email || !password) {
    throw new APIError("Valid credentials are required");
  }

  try {
    const data: RecordAuthResponse<User> = await pbClient
      .collection(DataCollections.USERS)
      .authWithPassword(email, password);

    return data;
  } catch (error) {
    throw new APIError(error, "Signin failed");
  }
};

const performSignup = async (
  pbClient: Pocketbase,
  email: string,
  password: string,
  passwordConfirm: string
) => {
  if (!email || !password || !passwordConfirm) {
    throw new APIError("Valid credentials are required");
  }

  if (password !== passwordConfirm) {
    throw new APIError("Password and confirm password values don't match");
  }

  try {
    const data: User = await pbClient
      .collection(DataCollections.USERS)
      .create({ email, password, passwordConfirm });

    return data;
  } catch (error) {
    throw new APIError(error, "Signup failed");
  }
};

const performUpdate = async (
  pbClient: Pocketbase,
  userId: User["id"],
  property: keyof User,
  value: string | ImageUploadPayload
) => {
  if (!value) {
    throw new APIError(`Valid ${property} is required`);
  }

  try {
    if (property === "avatar") {
      const avatarPayload = value as ImageUploadPayload;
      const base64Image = avatarPayload.imageBase64.split(";base64,").pop();
      if (!base64Image) throw new Error("Invalid image payload");

      const buffer = Buffer.from(base64Image, "base64");
      const avatar = new Blob([buffer], { type: avatarPayload.imageType });

      const formData = new FormData();
      formData.append("avatar", avatar, avatarPayload.imageName);

      const data: User = await pbClient
        .collection(DataCollections.USERS)
        .update<User>(userId, formData);

      return data;
    }
    const data: User = await pbClient
      .collection(DataCollections.USERS)
      .update<User>(userId, { [property]: value });

    return data;
  } catch (error) {
    throw new APIError(error, "Update failed");
  }
};

const performLogout = async (pbClient: Pocketbase) => {
  try {
    pbClient.authStore.clear();
    return pbClient.authStore.isValid;
  } catch (error) {
    throw new APIError(error, "Logout failed");
  }
};

const performPasswordChangeRequest = async (
  pbClient: Pocketbase,
  email: string
) => {
  if (!email) {
    throw new APIError("Valid email is required");
  }

  try {
    const data = await pbClient
      .collection(DataCollections.USERS)
      // SES sandbox mode will only send emails to confirmed emails
      .requestPasswordReset(
        process.env.NODE_ENV === "production"
          ? email
          : "marsianeca_ss@hotmail.com"
      );

    return data;
  } catch (error) {
    throw new APIError(error, "Password change request failed");
  }
};

const performPasswordChangeConfirm = async (
  pbClient: Pocketbase,
  token: string,
  password: string,
  passwordConfirm: string
) => {
  if (!token) {
    throw new APIError("Valid token is required");
  }

  if (password.length < 6) {
    throw new APIError("Valid password is required");
  }

  if (password != passwordConfirm) {
    throw new APIError("Password and confirm password do not match");
  }

  try {
    const data = await pbClient
      .collection(DataCollections.USERS)
      .confirmPasswordReset(token, password, passwordConfirm);

    return data;
  } catch (error) {
    throw new APIError(error, "Password change confirm failed");
  }
};

const getToken = async (pbClient: Pocketbase) => {
  try {
    return pbClient.authStore.token;
  } catch (error) {
    throw new APIError(error, "Token fetch failed");
  }
};

const getUser = async (pbClient: Pocketbase) => {
  try {
    return pbClient.authStore.model;
  } catch (error) {
    throw new APIError(error, "User fetch failed");
  }
};

export const authRouter = router({
  signin: procedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(({ ctx, input }) =>
      performSignin(ctx.pbClient, input.email, input.password)
    ),
  signup: procedure
    .input(
      z
        .object({
          email: z.string().email(),
          password: z.string().min(6),
          passwordConfirm: z.string(),
        })
        .required()
    )
    .mutation(({ ctx, input }) =>
      performSignup(
        ctx.pbClient,
        input.email,
        input.password,
        input.passwordConfirm
      )
    ),
  updateUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        property: z.string(),
        value: z.string().or(
          z.object({
            imageBase64: z.string(),
            imageName: z.string(),
            imageType: z.string(),
          })
        ),
      })
    )
    .mutation(({ ctx, input }) =>
      performUpdate(ctx.pbClient, input.userId, input.property, input.value)
    ),
  logout: protectedProcedure.mutation(({ ctx }) => performLogout(ctx.pbClient)),
  getToken: protectedProcedure.query(({ ctx }) => getToken(ctx.pbClient)),
  getUser: protectedProcedure.query(({ ctx }) => getUser(ctx.pbClient)),
  requestPasswordChange: procedure
    .input(z.string())
    .mutation(({ ctx, input }) =>
      performPasswordChangeRequest(ctx.pbClient, input)
    ),
  confirmPasswordChange: procedure
    .input(
      z.object({
        token: z.string(),
        password: z.string(),
        passwordConfirm: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      performPasswordChangeConfirm(
        ctx.pbClient,
        input.token,
        input.password,
        input.passwordConfirm
      )
    ),
});
