import type { RcFile } from "antd/es/upload/interface";
import cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";
import type { ClientResponseError } from "pocketbase";
import { z } from "zod";

import type { APIResponse, Business, OpeningHours } from "types";

export const Cors = cors({ methods: ["POST", "GET", "HEAD", "PUT", "PATCH"] });

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
export const FILES_URL = `${BACKEND_URL}/api/files`;

export const StorageKeys = {
  ACCESS_TOKEN: "accessToken",
  CURRENT_USER: "currentUser",
  COLOR_THEME: "colorTheme",
  SELECTED_LOCALE: "selectedLocale",
} as const;

export const SeverityLevel = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
} as const;

export const PaymentMethod = {
  BANK_TRANSFER: "Bank Transfer",
  PAYPAL: "PayPal",
} as const;

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PHONE_REGEX =
  /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d| 2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]| 4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/gim;

export const emailValidator = (value: string) =>
  !!value.trim().toLowerCase().match(EMAIL_REGEX)?.length;

export const passwordValidator = (pass: string) => pass.length >= 6;

export const emailSchema = z
  .string()
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password should be at least 6 characters long");

export const isApiResponse = <T>(res: unknown): res is APIResponse<T> =>
  !!res &&
  !Number.isNaN((res as APIResponse).page) &&
  !Number.isNaN((res as APIResponse).totalItems) &&
  Array.isArray((res as APIResponse).items);

export const isClientResponseError = (
  error: unknown
): error is ClientResponseError =>
  !!error &&
  !Number.isNaN((error as ClientResponseError).status) &&
  (error as ClientResponseError).status >= 400 &&
  (error as ClientResponseError).status < 500 &&
  typeof (error as ClientResponseError).url === "string" &&
  typeof (error as ClientResponseError).data === "object" &&
  typeof (error as ClientResponseError).isAbort === "boolean" &&
  "originalError" in (error as ClientResponseError);

export class APIError extends Error {
  isSystemError = true;
  message: string;

  constructor(message: unknown, defaultMessage = "Server ERROR!") {
    super();

    if (isClientResponseError(message)) {
      this.message = message.data.message;
    } else if (message instanceof Error) {
      this.message = (message as Error)?.message;
    } else if (typeof message === "string") {
      this.message = message;
    } else {
      this.message = defaultMessage;
    }
  }
}

export const defaultResponse = {
  page: 0,
  perPage: 0,
  totalItems: 0,
  totalPages: 0,
  items: [],
} satisfies APIResponse<Business>;

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as Array<keyof OpeningHours>;

export const notBatchedRequestPaths = [
  "getToken",
  "getUser",
  "business",
  "businesses",
  "businessAreas",
];

export const DataCollections = {
  AREAS: "areas",
  BUSINESSES: "businesses",
  BUSINESS_IMAGES: "businessImages",
  BUSINESS_PLANS: "businessPlans",
  BUSINESS_SERVICES: "businessServices",
  BUSINESS_SEARCHES: "businessSearches",
  CITIES: "cities",
  COUNTRIES: "countries",
  DIVISIONS: "divisions",
  IMAGE_ALBUMS: "imageAlbums",
  OFFERS: "offers",
  PAYMENTS: "payments",
  REGIONS: "regions",
  ROLES: "roles",
  SERVICE_CATEGORIES: "serviceCategories",
  SERVICES: "services",
  SOCIAL_LINKS: "socialLinks",
  SOCIAL_PLATFORMS: "socialPlatforms",
  SUBSCRIPTION_PLANS: "subscriptionPlans",
  UNITS_OF_MEASURE: "unitsOfMeasure",
  USER_BUSINESSES: "userBusinesses",
  USER_ROLES: "userRoles",
  USERS: "users",
} as const;

export const dummyUploadRequest = (options: any) => {
  setTimeout(() => {
    options.onSuccess("ok");
  }, 0);
};

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const allowedFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/svg+xml",
];

export const DEFAULT_ALBUM_NAME = "default";

export const defaultOpeningHours: OpeningHours = {
  Monday: ["", ""],
  Tuesday: ["", ""],
  Wednesday: ["", ""],
  Thursday: ["", ""],
  Friday: ["", ""],
  Saturday: ["", ""],
  Sunday: ["", ""],
};
