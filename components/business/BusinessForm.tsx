"use client";
import { Button, Form, Input } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload";
import { useEffect, useMemo, useState, type FC } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { Business, BusinessPayload } from "types";
import { FILES_URL, PHONE_REGEX, getBase64 } from "utils";
import { UploadImages } from "../custom/UploadImages";

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
  const [form] = Form.useForm<Business>();
  const formValues = Form.useWatch([], form);

  const initialImages: UploadFile[] = useMemo(
    () =>
      !!business?.thumbnail
        ? [
            {
              uid: business.id,
              name: business.thumbnail,
              status: "done",
              url: `${FILES_URL}/${business?.collectionId}/${business?.id}/${business?.thumbnail}?thumb=576x0`,
            },
          ]
        : [],
    [business]
  );

  const [isFormValid, setIsFormValid] = useState(!!formValues?.name);
  const [fileList, setFileList] = useState<UploadFile[]>(initialImages);

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

  const isLoading = isLoadingCreate || isLoadingUpdate;

  const trimmedFormValues = {
    name: formValues?.name?.trim(),
    description: formValues?.description?.trim(),
    thumbnail: formValues?.thumbnail?.trim() ?? "",
    address: formValues?.address?.trim(),
    contactEmail: formValues?.contactEmail?.trim(),
    contactPhone: formValues?.contactPhone?.trim(),
    contactWebsite: formValues?.contactWebsite?.trim(),
  };

  const hasChanges =
    trimmedFormValues.name !== business?.name.trim() ||
    trimmedFormValues.description !== business?.description.trim() ||
    (fileList[0]?.name ?? "") !== (business?.thumbnail ?? "") ||
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
    setFileList(initialImages);
    if (isEditing) {
      !!business && form.setFieldsValue(business);
    } else {
      form.resetFields();
    }
  };

  const handleSave = async () => {
    if (isEditing) {
      !!business &&
        updateBusiness({
          businessId: business.id,
          ...initialBusinessState,
          ...trimmedFormValues,
          openingHours: business?.openingHours,
          thumbnail: fileList.length
            ? {
                imageBase64: await getBase64(
                  fileList[0].originFileObj as RcFile
                ),
                imageName: fileList[0].name,
                imageType: fileList[0].type ?? "",
              }
            : undefined,
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

  useEffect(() => {
    setFileList(initialImages);
  }, [setFileList, initialImages]);

  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      className="w-full"
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
      <Form.Item label="Thumbnail" name="thumbnail">
        <UploadImages
          maxCount={1}
          fileList={fileList}
          setFileList={setFileList}
        />
      </Form.Item>
      <h4 className="text-lg font-bold text-primary my-6 border-b-2 border-slate-300">
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
      <section className="my-3 flex justify-between">
        <Button
          tabIndex={0}
          size="large"
          type="default"
          loading={isLoading}
          disabled={!hasChanges}
          className="custom-primary-button bg-accent"
          onClick={clearChanges}
        >
          Clear Changes
        </Button>
        <Button
          tabIndex={0}
          size="large"
          type="default"
          htmlType="submit"
          loading={isLoading}
          disabled={!isFormValid || !hasChanges}
          className="custom-primary-button w-40"
          onClick={handleSave}
        >
          Save
        </Button>
      </section>
    </Form>
  );
};
