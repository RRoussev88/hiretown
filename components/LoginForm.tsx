"use client";
import { Button, Form, Input, Modal } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { type FC, useContext, useEffect, useState } from "react";

import { AuthContext } from "context/AuthContext";
import { useErrorToaster, useValidate } from "hooks";
import { trpc } from "trpc";
import { emailSchema, passwordSchema } from "utils";

type LoginFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenForgotPassForm: () => void;
  onOpenRegisterForm: () => void;
};

export const LoginForm: FC<LoginFormProps> = ({
  isOpen,
  onClose,
  onOpenForgotPassForm,
  onOpenRegisterForm,
}) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { loginUser } = useContext(AuthContext);

  const [isLoginTried, setIsLoginTried] = useState(false);
  const [email, setEmail, isEmailValid, emailError] = useValidate(emailSchema);
  const [password, setPassword, isPasswordValid, passwordError] =
    useValidate(passwordSchema);

  const { data, isSuccess, isLoading, isError, error, mutate, reset } =
    trpc.signin.useMutation();

  const hasEmailError =
    isLoginTried && !isEmailValid && !!emailError.errors.length;

  const hasPasswordError =
    isLoginTried && !isPasswordValid && passwordError.errors.length;

  const handleLogin = async () => {
    setIsLoginTried(true);
    if (!isEmailValid || !isPasswordValid) return;

    mutate({ email, password });
  };

  const errorToaster = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error signing in"
  );

  useEffect(() => {
    !isOpen && reset();
  }, [isOpen, reset]);

  // Log user when sign in is successful
  useEffect(() => {
    data && loginUser(data.token, data.record);
  }, [data, loginUser]);

  //Clean state and close modal successfull signin
  useEffect(() => {
    const resetState = () => {
      setEmail("");
      setPassword("");
      setIsLoginTried(false);
    };

    if (isSuccess) {
      resetState();
      onClose();
      router.push("/profile");
    }

    return resetState;
  }, [isSuccess, setEmail, setPassword, onClose, router]);

  return (
    <Modal
      title="Login"
      closable={false}
      destroyOnClose
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      {errorToaster}
      <Form
        form={form}
        layout="vertical"
        size="large"
        className="w-full"
        disabled={isLoading}
      >
        <Form.Item
          required
          validateStatus={clsx({ error: hasEmailError }) as ""}
          help={
            isLoginTried &&
            !isEmailValid &&
            emailError.errors.map((err) => err.message).join("; ")
          }
        >
          <Input
            status={clsx({ error: hasEmailError }) as ""}
            aria-required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Form.Item>
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
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Item>
        <Button
          tabIndex={0}
          block
          disabled={isLoading}
          loading={isLoading}
          type="default"
          className="custom-primary-button"
          size="large"
          onClick={handleLogin}
        >
          Sign in
        </Button>
      </Form>
      <Button
        tabIndex={0}
        type="link"
        className="custom-link-button"
        size="large"
        onClick={onOpenRegisterForm}
      >
        No account yet? Click here to Sign up
      </Button>
      <Button
        tabIndex={0}
        type="link"
        className="custom-link-button"
        size="large"
        onClick={onOpenForgotPassForm}
      >
        Forgot password
      </Button>
    </Modal>
  );
};
