"use client";
import { UploadOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload";
import Image from "next/image";
import { useState, type FC, Dispatch, SetStateAction } from "react";

import { useBeforeUpload } from "hooks";
import { allowedFileTypes, dummyUploadRequest, getBase64 } from "utils";

type UploadImagesProps = {
  fileList: UploadFile[];
  setFileList: Dispatch<SetStateAction<UploadFile[]>>;
  maxCount: number;
};

export const UploadImages: FC<UploadImagesProps> = ({
  fileList,
  setFileList,
  maxCount = 1,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleChange: UploadProps["onChange"] = (info) =>
    setFileList(info.fileList);

  const handleClear = () => setFileList([]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
    setPreviewOpen(true);
  };

  const handleClosePreview = () => setPreviewOpen(false);

  return (
    <>
      <Upload
        action=""
        customRequest={dummyUploadRequest}
        name="thumbnail"
        accept={allowedFileTypes.join(", ")}
        beforeUpload={useBeforeUpload}
        listType="picture-card"
        fileList={fileList}
        maxCount={maxCount}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleClear}
      >
        <div>
          <UploadOutlined rev="" />
          <div className="mt-2">Upload</div>
        </div>
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleClosePreview}
      >
        <Image
          alt={previewTitle}
          className="w-full"
          src={previewImage}
          width={576}
          height={576}
          quality={100}
        />
      </Modal>
    </>
  );
};
