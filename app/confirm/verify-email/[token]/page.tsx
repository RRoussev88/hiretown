"use client";
import { Skeleton } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { trpc } from "trpc";

type ConfirmPasswordResetProps = { params: { token: string } };

const ConfirmPasswordReset: NextPage<ConfirmPasswordResetProps> = ({
  params,
}) => {
  const router = useRouter();

  const { isLoading, isError, isSuccess, error, mutate, reset } =
    trpc.confirmEmailVerification.useMutation({
      onSettled: (isConfirmed) => {
        if (isConfirmed) {
          setTimeout(() => {
            reset();
            router.replace("/profile/settings/overview");
          }, 5000);
        }
      },
    });

  useEffect(() => {
    mutate(params.token);
  }, [mutate, params.token]);

  return (
    <section className="border border-slate-300 shadow rounded-md p-6 w-full max-w-sm mx-auto">
      <h4 className="text-lg font-bold text-primary-content mb-6 border-b-2 border-slate-300">
        Verifying email
      </h4>
      <Skeleton loading={isLoading} />
      {isError && <p className="text-error">{error.message}</p>}
      {isSuccess && (
        <p className="text-success">
          Your email has been successfully verified
        </p>
      )}
    </section>
  );
};

export default ConfirmPasswordReset;
