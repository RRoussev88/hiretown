import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Space, Upload } from "antd";
import type {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";

import { Cancel, Save } from "components";
import { useBeforeUpload, useErrorToaster } from "hooks";
import Image from "next/image";
import { useEffect, useState, type FC } from "react";
import { ImageUploadPayload } from "types";
import { allowedFileTypes, dummyUploadRequest, getBase64 } from "utils";

type EditAvatarProps = {
  errorMessage: string;
  initialValue?: string;
  isLoading: boolean;
  editedProperty: string;
  onSaveProperty: (property: string, value: ImageUploadPayload) => void;
  setEditedProperty: (name: string) => void;
};

export const EditAvatar: FC<EditAvatarProps> = ({
  errorMessage,
  initialValue,
  isLoading,
  editedProperty,
  onSaveProperty,
  setEditedProperty,
}) => {
  const inputDisabled = !!editedProperty && editedProperty !== "Avatar";
  const [imageUrl, setImageUrl] = useState<string>(initialValue ?? "");
  const [uploadedFile, setuploadedFile] = useState<RcFile>();

  const contextHolder = useErrorToaster(
    !!errorMessage,
    isLoading,
    errorMessage
  );

  const handleChange: UploadProps["onChange"] = async (
    info: UploadChangeParam<UploadFile>
  ) => {
    setImageUrl("");
    setEditedProperty("Avatar");

    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.status === "done") {
      const url = await getBase64(info.file.originFileObj as RcFile);
      setImageUrl(url);
      setuploadedFile(info.file.originFileObj);
    }
  };

  const handleCancelClick = () => {
    setImageUrl(initialValue ?? "");
    setEditedProperty("");
  };

  const handleSave = () => {
    if (initialValue === imageUrl) return;
    if (!uploadedFile) return;

    onSaveProperty("avatar", {
      imageName: uploadedFile.name,
      imageType: uploadedFile.type,
      imageBase64: imageUrl,
    });
  };

  useEffect(() => setImageUrl(initialValue ?? ""), [initialValue]);

  return (
    <div>
      {contextHolder}
      <p className="text-sm">Avatar</p>
      <Upload
        action=""
        customRequest={dummyUploadRequest}
        name="avatar"
        accept={allowedFileTypes.join(", ")}
        maxCount={1}
        listType="picture-circle"
        showUploadList={false}
        beforeUpload={useBeforeUpload}
        onChange={handleChange}
        disabled={inputDisabled}
      >
        {imageUrl ? (
          <Image
            loader={({ src }) => src}
            src={imageUrl}
            alt="avatar"
            className="rounded-full"
            width={100}
            height={100}
          />
        ) : (
          <div>
            {isLoading ? <LoadingOutlined rev="" /> : <PlusOutlined rev="" />}
            <div className="mt-2">Upload</div>
          </div>
        )}
      </Upload>
      <Space.Compact size="large" className="w-full mb-6">
        <Button
          type="default"
          className="bg-primary"
          onClick={handleCancelClick}
          disabled={isLoading || !editedProperty || editedProperty !== "Avatar"}
          icon={<Cancel />}
        />
        <Button
          type="default"
          className="bg-primary"
          onClick={handleSave}
          disabled={!imageUrl || imageUrl === initialValue}
          loading={isLoading && editedProperty === "Avatar"}
          icon={<Save />}
        />
      </Space.Compact>
    </div>
  );
};
