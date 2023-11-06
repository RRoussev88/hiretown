"use client";
import type { ProcedureUseQuery } from "@trpc/react-query/src/createTRPCReact";
import type {
  AnyRootConfig,
  BuildProcedure,
  ProcedureParams,
} from "@trpc/server";
import { message, notification } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { useRouter } from "next/navigation";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SafeParseError,
  SafeParseReturnType,
  SafeParseSuccess,
  ZodError,
  ZodType,
} from "zod";

import type { RecordModel as CollectionRecord } from "pocketbase";
import { trpc } from "trpc";
import type { APIResponse, Business, BusinessImage, ImageAlbum } from "types";
import { allowedFileTypes } from "utils";

export const useIsVisible = (ref: MutableRefObject<HTMLElement | null>) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );

    ref.current && observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
};

export const useValidatedInput = (
  predicate: (text: string) => boolean
): [string, Dispatch<SetStateAction<string>>, boolean] => {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(predicate(value));
  }, [value, predicate]);

  return [value, setValue, isValid];
};

export const useValidate = <Out = any>(
  schema: ZodType<Out>
): [Out, Dispatch<SetStateAction<Out>>, boolean, ZodError, Out] => {
  const [value, setValue] = useState<Out>("" as Out);
  const [parsedResult, setParsedResult] = useState<
    SafeParseReturnType<typeof value, Out>
  >({ success: true, data: "" } as SafeParseReturnType<typeof value, Out>);

  useEffect(() => {
    setParsedResult(schema.safeParse(value));
  }, [value, schema]);

  return [
    value,
    setValue,
    parsedResult.success,
    (parsedResult as SafeParseError<Out>).error ?? null,
    (parsedResult as SafeParseSuccess<Out>).data,
  ];
};

export const useErrorToaster = (
  isError: boolean,
  isSuccess: boolean,
  errorMessage: string
) => {
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    isSuccess && api.destroy();
  }, [api, isSuccess]);

  useEffect(() => {
    isError && api.error({ message: "Error", description: errorMessage });
  }, [api, isError, errorMessage]);

  return contextHolder;
};

export const useSuccessToaster = (
  isSuccess: boolean,
  successMessage: string
) => {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    isSuccess &&
      api.success({ message: "Success", description: successMessage });
  }, [api, isSuccess, successMessage]);

  return contextHolder;
};

export const useFetchAndSelect = <
  T extends CollectionRecord = any,
  P extends string = string,
  Q = any
>(
  query: ProcedureUseQuery<
    BuildProcedure<
      "query",
      ProcedureParams<AnyRootConfig, unknown, Q>,
      APIResponse<T>
    >,
    P
  >,
  errorMessage: string,
  queryInput?: Q,
  autoSelect?: boolean
) => {
  const { data, isSuccess, error, isError, ...rest } = query<
    APIResponse<T>,
    APIResponse<T>
  >(queryInput);

  const items = useMemo(
    () => (Array.isArray(data) ? data : data?.items ?? []),
    [data]
  );

  const [selected, setSelected] = useState<T | null>(() =>
    autoSelect && isSuccess && items?.length ? items[0] : null
  );

  useEffect(() => {
    if (isSuccess) {
      autoSelect && setSelected(items?.length ? items[0] : null);
    }
  }, [isSuccess, autoSelect, items]);

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? errorMessage
  );

  if (Array.isArray(data)) {
    const returnResponse: APIResponse<T> = {
      page: 1,
      perPage: 20,
      totalItems: data?.length ?? 0,
      totalPages: Math.ceil((data?.length ?? 1) / 20),
      items: data ?? [],
    };
    return {
      data: returnResponse,
      isSuccess,
      error,
      isError,
      ...rest,
      selected,
      setSelected,
      contextHolder,
    };
  }
  return {
    data,
    isSuccess,
    error,
    isError,
    ...rest,
    selected,
    setSelected,
    contextHolder,
  };
};

export const useClickOutside = (
  refs: MutableRefObject<HTMLElement | null>[],
  callback: Function
) => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (
        refs.every(
          (ref) => ref.current && !ref.current.contains(event.target as Node)
        )
      ) {
        callback();
      }
    },
    [refs, callback]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);
};

export const useLogoutUser = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { mutate: logoutMutation } = trpc.logout.useMutation({
    onSettled: async (isLoggedIn?: boolean) => {
      if (!isLoggedIn) {
        await utils.getToken.invalidate();
        await utils.getUser.invalidate();
      }
      router.replace("/");
    },
  });

  return logoutMutation;
};

export const useBusinessAlbumImages = (business?: Business) => {
  const {
    data: imagesData,
    isLoading,
    isSuccess: isImagesSuccess,
  } = trpc.businessImages.useQuery(business?.id ?? "", { enabled: !!business });

  return useMemo(() => {
    const map = new Map<ImageAlbum, BusinessImage[]>();

    if (!!business && isImagesSuccess && !isLoading) {
      business.expand["imageAlbums(business)"]?.forEach((album: ImageAlbum) => {
        const images = imagesData.items.filter(
          (image: BusinessImage) => image.album === album.id
        );
        map.set(album, images);
      });
    }

    return map;
  }, [business, isLoading, isImagesSuccess, imagesData]);
};

export const useBeforeUpload = (file: RcFile) => {
  const isAllowedType = allowedFileTypes.includes(file.type);
  if (!isAllowedType) {
    message.error("You can only upload JPG,PNG or GIF files!");
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }

  return isAllowedType && isLt2M;
};
