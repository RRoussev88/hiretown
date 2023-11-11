"use client";
import { Button, Form, Input } from "antd";
import clsx from "clsx";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useValidate, useValidatedInput } from "hooks";
import { trpc } from "trpc";
import { passwordSchema } from "utils";

type ConfirmPasswordResetProps = { params: { token: string } };

const ConfirmPasswordReset: NextPage<ConfirmPasswordResetProps> = ({
  params,
}) => {
  const router = useRouter();
  const [form] = Form.useForm();

  const [isLoginTried, setIsLoginTried] = useState(false);
  const [password, setPassword, isPasswordValid, passwordError] =
    useValidate(passwordSchema);
  const [passwordConfirm, setPasswordConfirm, isConfirmPassValid] =
    useValidatedInput((confirmPass) => confirmPass === password);

  const { isLoading, isError, error, isSuccess, mutate, reset } =
    trpc.confirmPasswordChange.useMutation({
      onSettled: (isConfirmed) => {
        if (isConfirmed) {
          setTimeout(() => {
            setPassword("");
            setPasswordConfirm("");
            setIsLoginTried(false);
            reset();

            router.replace("/?login=true");
          }, 5000);
        }
      },
    });

  const hasPasswordError =
    isError ||
    (isLoginTried && !isPasswordValid && passwordError.errors.length);

  const hasConfirmPasswordError =
    isError || (isLoginTried && isPasswordValid && !isConfirmPassValid);

  const handleSavePassword = async () => {
    setIsLoginTried(true);
    if (!isPasswordValid || !isConfirmPassValid) return;

    mutate({ token: params.token, password, passwordConfirm });
  };

  return (
    <section className="border border-slate-300 shadow rounded-md p-6 w-full max-w-sm mx-auto">
      <h4 className="text-lg font-bold text-primary-content mb-6 border-b-2 border-slate-300">
        Change your password
      </h4>
      <Form
        form={form}
        layout="vertical"
        size="large"
        className="w-full"
        disabled={isLoading}
      >
        <Form.Item
          required
          validateStatus={clsx({ error: hasPasswordError }) as ""}
          help={
            isLoginTried &&
            !isPasswordValid &&
            passwordError.errors.map((err) => err.message).join("; ")
          }
        >
          <Input
            status={clsx({ error: hasPasswordError }) as ""}
            aria-required
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Item>
        <Form.Item
          required
          validateStatus={clsx({ error: hasConfirmPasswordError }) as ""}
          help={
            isLoginTried &&
            isPasswordValid &&
            !isConfirmPassValid &&
            "Password and confirm password values don't match"
          }
        >
          <Input
            status={clsx({ error: hasConfirmPasswordError }) as ""}
            aria-required
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
        </Form.Item>
        <p className="text-md text-accent-focus">
          Make sure it is at least 6 characters long
        </p>
        <Button
          block
          disabled={isLoading || isSuccess}
          loading={isLoading}
          type="default"
          className="custom-primary-button"
          size="large"
          onClick={handleSavePassword}
        >
          Change Password
        </Button>
      </Form>
      {isError && <p className="text-error">{error.message}</p>}
      {isSuccess && (
        <p className="text-success">
          Your password has been successfully changed
        </p>
      )}
    </section>
  );
};

export default ConfirmPasswordReset;
