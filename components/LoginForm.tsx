"use client";
import { Button, Form, Input, Modal, Tag } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { FC, useContext, useEffect, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import { useValidate } from "../hooks";
import { trpc } from "../trpc";
import { emailSchema, passwordSchema } from "../utils";

type LoginFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterForm: () => void;
};

export const LoginForm: FC<LoginFormProps> = ({
  isOpen,
  onClose,
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

  useEffect(() => {
    !isOpen && reset();
  }, [isOpen, reset]);

  // Log user when sign in is successful
  useEffect(() => {
    data && loginUser(data.token, data.record);
  }, [data, loginUser]);

  //Clean state and close modal successfull signin
  useEffect(() => {
    if (isSuccess) {
      setEmail("");
      setPassword("");
      setIsLoginTried(false);
      onClose();
      router.push("/profile");
    }
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
        {isError && (
          <Tag color="red" className="text-error w-full mb-4">
            {error.message}
          </Tag>
        )}
        <Button
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
        block
        type="link"
        className="custom-link-button"
        size="large"
        onClick={onOpenRegisterForm}
      >
        No account yet? Click here to Sign up
      </Button>
    </Modal>
  );
};
