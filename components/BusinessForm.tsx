"use client";
import { Button, Form, Input } from "antd";
import { useEffect, useState, type FC } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { Business, BusinessPayload } from "types";
import { PHONE_REGEX } from "utils";

const initialBusinessState: BusinessPayload = {
  name: "",
  isActive: true,
  priority: 1,
  rating: 5,
};

const validateMessages = {
  required: "${name} is required!",
  types: { email: "Invalid email!", url: "Invalid URL!" },
};

type BusinessFormProps = {
  business?: Business;
  isEditing?: boolean;
  onSuccess?: () => void;
};

export const BusinessForm: FC<BusinessFormProps> = ({
  isEditing,
  business,
  onSuccess,
}) => {
  const [form] = Form.useForm<BusinessPayload>();
  const formValues = Form.useWatch([], form);

  const {
    mutate: createBusiness,
    isLoading: isLoadingCreate,
    isError: isErrorCreate,
    isSuccess: isSuccessCreate,
    error: errorCreate,
  } = trpc.createBusiness.useMutation({ onSuccess });

  const {
    mutate: updateBusiness,
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    isSuccess: isSuccessUpdate,
    error: errorUpdate,
  } = trpc.updateBusiness.useMutation({ onSuccess });

  const [isFormValid, setIsFormValid] = useState(!!formValues?.name);

  const isLoading = isLoadingCreate || isLoadingUpdate;

  const trimmedFormValues = {
    name: formValues?.name?.trim(),
    description: formValues?.description?.trim(),
    address: formValues?.address?.trim(),
    contactEmail: formValues?.contactEmail?.trim(),
    contactPhone: formValues?.contactPhone?.trim(),
    contactWebsite: formValues?.contactWebsite?.trim(),
  };

  const hasChanges =
    trimmedFormValues.name !== business?.name.trim() ||
    trimmedFormValues.description !== business?.description.trim() ||
    trimmedFormValues.address !== business?.address.trim() ||
    trimmedFormValues.contactEmail !== business?.contactEmail.trim() ||
    trimmedFormValues.contactPhone !== business?.contactPhone.trim() ||
    trimmedFormValues.contactWebsite !== business?.contactWebsite.trim();

  const contextHolder = useErrorToaster(
    isErrorCreate || isErrorUpdate,
    isSuccessCreate || isSuccessUpdate,
    (errorCreate || errorUpdate)?.message ?? "Error saving a business"
  );

  const clearChanges = () => {
    if (isEditing) {
      !!business && form.setFieldsValue(business);
    } else {
      form.resetFields();
    }
  };

  const handleSave = () => {
    if (isEditing) {
      !!business &&
        updateBusiness({
          businessId: business.id,
          ...initialBusinessState,
          ...trimmedFormValues,
          openingHours: business?.openingHours,
        });
    } else {
      createBusiness({
        ...initialBusinessState,
        ...trimmedFormValues,
        openingHours: business?.openingHours,
      });
    }
  };

  useEffect(() => {
    if (!!business) {
      form.setFieldsValue(business);
    }
  }, [business, form]);

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => setIsFormValid(true),
      () => setIsFormValid(false)
    );
  }, [form, formValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      className="w-full sm:w-9/12 mx-auto"
      disabled={isLoading}
      validateMessages={validateMessages}
    >
      {contextHolder}
      <Form.Item required name="name" rules={[{ required: true }]}>
        <Input aria-required type="name" name="name" placeholder="Name" />
      </Form.Item>
      <Form.Item name="description">
        <Input.TextArea name="description" placeholder="Description" />
      </Form.Item>
      <h4 className="text-lg font-bold text-neutral-content my-6 border-b-2 border-slate-300">
        Contacts
      </h4>
      <Form.Item name="address">
        <Input type="address" name="address" placeholder="Address" />
      </Form.Item>
      <Form.Item name="contactEmail" rules={[{ type: "email" }]}>
        <Input type="email" name="email" placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="contactPhone"
        rules={[
          {
            message: "Invalid phone number. Start with +",
            pattern: new RegExp(PHONE_REGEX),
          },
        ]}
      >
        <Input type="tel" name="phone" placeholder="Phone Number" />
      </Form.Item>
      <Form.Item name="contactWebsite" rules={[{ type: "url" }]}>
        <Input type="url" name="website" placeholder="Website" />
      </Form.Item>
      <section className="my-2 flex gap-x-3">
        <Button
          size="large"
          type="default"
          loading={isLoading}
          disabled={isLoading || !hasChanges}
          className="custom-primary-button bg-accent"
          onClick={clearChanges}
        >
          Clear Changes
        </Button>
        <Button
          size="large"
          type="default"
          htmlType="submit"
          loading={isLoading}
          disabled={!isFormValid || isLoading || !hasChanges}
          className="custom-primary-button flex-1"
          onClick={handleSave}
        >
          Save
        </Button>
      </section>
    </Form>
  );
};
