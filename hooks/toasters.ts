import { notification } from "antd";
import { useEffect } from "react";

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
    isError && api.error({ message: "Error", description: errorMessage, key: errorMessage });
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
