import { Button, Form, Input, Space } from "antd";
import clsx from "clsx";
import { useEffect, useState, type FC } from "react";

import { Cancel, Edit, Save } from "components";
import { emailSchema } from "utils";
import { useValidate } from "hooks";

type EditTextPropertyProps = {
  errorMessage: string;
  initialValue?: string;
  isLoading: boolean;
  propertyName: string;
  editedProperty: string;
  onSaveProperty: (property: string, value: string) => void;
  setEditedProperty: (name: string) => void;
};

export const EditTextProperty: FC<EditTextPropertyProps> = ({
  errorMessage,
  initialValue,
  isLoading,
  propertyName,
  editedProperty,
  onSaveProperty,
  setEditedProperty,
}) => {
  const [form] = Form.useForm();
  const initialValueStr = initialValue ?? "";
  const showErrorMessage = !!errorMessage && editedProperty === propertyName;
  const [propertyValue, setPropertyValue] = useState(initialValueStr);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [email, setEmail, isEmailValid, emailError] = useValidate(emailSchema);

  const handleEditClick = () => {
    setEditedProperty(propertyName);
    setInputDisabled((prevState) => !prevState);
  };

  const handleCancelClick = () => {
    setPropertyValue(initialValueStr);
    setEditedProperty("");
    setInputDisabled((prevState) => !prevState);
  };

  const handleSave = () => {
    if (initialValueStr === propertyValue) return;
    // TODO: Send a confirmation code on email change
    if (propertyName.toLowerCase() === "email") {
      setEmail(propertyValue);
      if (!isEmailValid) return;
    }

    onSaveProperty(propertyName.toLowerCase(), propertyValue);
  };

  useEffect(() => setPropertyValue(initialValue ?? ""), [initialValue]);

  useEffect(() => {
    !editedProperty && setInputDisabled(true);
  }, [editedProperty]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={propertyName}
        validateStatus={clsx({ error: showErrorMessage }) as ""}
        help={
          (showErrorMessage && errorMessage) ||
          (!!email &&
            !isEmailValid &&
            emailError.errors.map((err) => err.message).join("; "))
        }
      >
        <Space.Compact size="large" className="w-full">
          <Input
            status={clsx({ error: showErrorMessage }) as ""}
            placeholder={propertyName.toLowerCase()}
            value={propertyValue ?? ""}
            disabled={
              inputDisabled &&
              (!errorMessage ||
                !editedProperty ||
                editedProperty !== propertyName)
            }
            onChange={(event) => setPropertyValue(event.target.value)}
          />
          {inputDisabled || isLoading ? (
            <Button
              type="default"
              className="bg-primary"
              onClick={handleEditClick}
              loading={isLoading && editedProperty === propertyName}
              disabled={
                isLoading ||
                (!!editedProperty && editedProperty !== propertyName)
              }
              icon={<Edit />}
            />
          ) : (
            <>
              <Button
                type="default"
                className="bg-primary"
                onClick={handleCancelClick}
                icon={<Cancel />}
              />
              <Button
                type="default"
                className="bg-primary"
                onClick={handleSave}
                disabled={!!propertyValue && propertyValue === initialValue}
                icon={<Save />}
              />
            </>
          )}
        </Space.Compact>
      </Form.Item>
    </Form>
  );
};
