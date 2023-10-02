"use client";
import { Button, Form, Input, Modal, Tag } from "antd";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState, type FC } from "react";

import { AuthContext } from "../context/AuthContext";
import { useValidate, useValidatedInput } from "../hooks";
import { trpc } from "../trpc";
import { emailSchema, passwordSchema } from "../utils";

type RegisterFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginForm: () => void;
};

export const RegisterForm: FC<RegisterFormProps> = ({
  isOpen,
  onClose,
  onOpenLoginForm,
}) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { loginUser } = useContext(AuthContext);

  const [isLoginTried, setIsLoginTried] = useState(false);
  const [email, setEmail, isEmailValid, emailError] = useValidate(emailSchema);
  const [password, setPassword, isPasswordValid, passwordError] =
    useValidate(passwordSchema);
  const [passwordConfirm, setPasswordConfirm, isConfirmPassValid] =
    useValidatedInput((confirmPass) => confirmPass === password);

  const {
    isSuccess: isSignupSuccess,
    isLoading: isSignupLoading,
    isError: isSignupError,
    error: signupError,
    mutate: mutateSignup,
  } = trpc.signup.useMutation();

  const {
    data,
    isSuccess: isSigninSuccess,
    isLoading: isSigninLoading,
    isError: isSigninError,
    error: signinError,
    mutate: mutateSignin,
  } = trpc.signin.useMutation();

  const isLoading = isSignupLoading || isSigninLoading;

  const hasEmailError =
    isSignupError ||
    isSigninError ||
    (isLoginTried && !isEmailValid && !!emailError.errors.length);

  const hasPasswordError =
    isSignupError ||
    isSigninError ||
    (isLoginTried && !isPasswordValid && passwordError.errors.length);

  const hasConfirmPasswordError =
    isSignupError ||
    isSigninError ||
    (isLoginTried && isPasswordValid && !isConfirmPassValid);

  const handleRegister = async () => {
    setIsLoginTried(true);
    if (!isEmailValid || !isPasswordValid || !isConfirmPassValid) return;

    mutateSignup({ email, password, passwordConfirm });
  };

  // Call signin on successfull signup
  useEffect(() => {
    isSignupSuccess && mutateSignin({ email, password });
  }, [isSignupSuccess, email, password, mutateSignin]);

  // Log user when sign in is successful
  useEffect(() => {
    data && loginUser(data.token, data.record);
  }, [data, loginUser]);

  //Clean state and close modal successfull signin
  useEffect(() => {
    if (isSigninSuccess) {
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setIsLoginTried(false);
      onClose();
      router.push("/profile");
    }
  }, [
    isSigninSuccess,
    setEmail,
    setPassword,
    setPasswordConfirm,
    onClose,
    router,
  ]);

  return (
    <Modal
      title="Register"
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
        <Form.Item
          required
          validateStatus={clsx({ error: hasConfirmPasswordError }) as ""}
          help={
            isLoginTried &&
            isPasswordValid &&
            !isConfirmPassValid &&
            "Password and confirm password values don&apos;t match"
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
        {(isSignupError || isSigninError) && (
          <Tag color="red" className="text-error w-full mb-4">
            {(signupError ?? signinError)?.message}
          </Tag>
        )}
        <Button
          block
          disabled={isLoading}
          loading={isLoading}
          type="default"
          className="custom-primary-button"
          size="large"
          onClick={handleRegister}
        >
          Sign up
        </Button>
      </Form>
      <Button
        block
        type="link"
        className="custom-link-button"
        size="large"
        onClick={onOpenLoginForm}
      >
        Already have an account? Click here to Sign in.
      </Button>
    </Modal>
  );
};
