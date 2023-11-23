import type { ProcedureUseQuery } from "@trpc/react-query/src/createTRPCReact";
import type {
  AnyRootConfig,
  BuildProcedure,
  ProcedureParams,
} from "@trpc/server";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { RecordModel as CollectionRecord } from "pocketbase";
import { trpc } from "trpc";
import type { APIResponse } from "types";
import { useErrorToaster } from "./toasters";

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
