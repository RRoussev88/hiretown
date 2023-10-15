"use client";
import { Button, Form, Input, Modal, notification } from "antd";
import clsx from "clsx";
import { useState, type FC } from "react";

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
  const [api, notificationContext] = notification.useNotification();

  const [isLoginTried, setIsLoginTried] = useState(false);
  const [email, setEmail, isEmailValid, emailError] = useValidate(emailSchema);

  const { mutate, isLoading, isSuccess, reset } =
    trpc.requestPasswordChange.useMutation({
      onSettled: (_, error) => {
        if (error) {
          api.error({ message: "Error", description: error.message });
        } else {
          api.info({
            message: "Email sent",
            description: "Reset password link was sent to the provided email",
          });

          setTimeout(() => {
            setEmail("");
            setIsLoginTried(false);
            reset();
            onClose();
            onOpenLoginForm();
          }, 5000);
        }
      },
    });

  const hasEmailError =
    isLoginTried && !isEmailValid && !!emailError.errors.length;

  const handleLogin = () => {
    setIsLoginTried(true);
    if (!isEmailValid) return;

    mutate(email);
  };

  return (
    <Modal
      title="Reset your password"
      closable={false}
      destroyOnClose
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      {notificationContext}
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
        <Button
          block
          disabled={isLoading || isSuccess}
          loading={isLoading}
          type="default"
          className="custom-primary-button"
          size="large"
          onClick={handleLogin}
        >
          Send reset email
        </Button>
      </Form>
    </Modal>
  );
};
