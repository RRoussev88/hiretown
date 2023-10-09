"use client";
import { Button, Form, Input, Modal, Tag } from "antd";
import clsx from "clsx";
import { useEffect, useState, type FC } from "react";

import { useValidate } from "hooks";
import { trpc } from "trpc";
import { emailSchema } from "utils";

type ForgotPasswordFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginForm: () => void;
};

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({
  isOpen,
  onClose,
  onOpenLoginForm,
}) => {
  const [form] = Form.useForm();

  const [isLoginTried, setIsLoginTried] = useState(false);
  const [email, setEmail, isEmailValid, emailError] = useValidate(emailSchema);

  const { mutate, isError, error, isLoading, isSuccess } =
    trpc.requestPasswordChange.useMutation();

  const hasEmailError =
    isLoginTried && !isEmailValid && !!emailError.errors.length;

  const handleLogin = () => {
    setIsLoginTried(true);
    if (!isEmailValid) return;

    mutate(email);
  };

  //Clean state and close modal successfull request password change
  useEffect(() => {
    const resetState = () => {
      setEmail("");
      setIsLoginTried(false);
    };

    if (isSuccess) {
      resetState();
      onClose();
      onOpenLoginForm();
    }

    return resetState;
  }, [isSuccess, setEmail, onClose, onOpenLoginForm]);

  return (
    <Modal
      title="Reset your password"
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
          Send password reset email
        </Button>
      </Form>
    </Modal>
  );
};
