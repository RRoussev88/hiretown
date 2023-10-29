import { type FC, useEffect, useMemo, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Upload } from "antd";
import Image from "next/image";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload";

import { Cancel, Save } from "components";
import { useBeforeUpload } from "hooks";
import {
  allowedFileTypes,
  DEFAULT_ALBUM_NAME,
  dummyUploadRequest,
  FILES_URL,
  getBase64,
} from "utils";
import { BusinessImage, ImageAlbum, ImageUploadPayload } from "types";

type AlbumImagesProps = {
  album: ImageAlbum;
  images: BusinessImage[];
  isLoading: boolean;
  onSave: (
    albumId: string,
    imagePayloads: ImageUploadPayload[],
    deleteImages: string[]
  ) => void;
};

export const AlbumImages: FC<AlbumImagesProps> = ({
  album,
  images,
  isLoading,
  onSave,
}) => {
  const initialImages: UploadFile[] = useMemo(
    () =>
      images.map((image) => ({
        uid: image.id,
        name: image.image,
        status: "done",
        url: `${FILES_URL}/${image.collectionId}/${image.id}/${image.image}?thumb=576x0`,
      })),
    [images]
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>(initialImages);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleChange: UploadProps["onChange"] = (info) =>
    setFileList(info.fileList);

  const handleClear = () => setFileList(initialImages);

  const handleSave = async () => {
    const initialUids = initialImages.map((image) => image.uid);
    const imagesToUpload = fileList.filter(
      (file) => !initialUids.includes(file.uid)
    );

    const imagePayloads = await Promise.all(
      imagesToUpload.map(async (image) => ({
        imageBase64: await getBase64(image.originFileObj as RcFile),
        imageName: image.name,
        imageType: image.type ?? "",
      }))
    );

    const currentUids = fileList.map((image) => image.uid);
    const deleteImages = initialUids.filter(
      (uid) => !currentUids.includes(uid)
    );

    onSave(album.id, imagePayloads, deleteImages);
  };

  useEffect(() => {
    const initialFileNames = initialImages.map((image) => image.name);
    const newFiles = fileList.filter(
      (file) => !initialFileNames.includes(file.name)
    );

    const currentFileNames = fileList.map((image) => image.name);
    const deleteImages = initialFileNames.filter(
      (fileName) => !currentFileNames.includes(fileName)
    );
    setHasChanges(!!newFiles.length || !!deleteImages.length);
  }, [initialImages, fileList]);

  useEffect(() => {
    setFileList(initialImages);
  }, [setFileList, initialImages]);

  return (
    <div className="border border-slate-300 shadow rounded-md p-2 w-full">
      <div className="flex justify-between w-full pb-2">
        {album.name !== DEFAULT_ALBUM_NAME && (
          <span className="text-accent">{album.name}</span>
        )}
        <Space.Compact size="large">
          <Button
            type="default"
            className="bg-primary"
            onClick={handleClear}
            disabled={isLoading || !hasChanges}
            icon={<Cancel />}
          />
          <Button
            type="default"
            className="bg-primary"
            onClick={handleSave}
            disabled={!hasChanges}
            loading={isLoading}
            icon={<Save />}
          />
        </Space.Compact>
      </div>
      <Upload
        action=""
        customRequest={dummyUploadRequest}
        name={album.name}
        accept={allowedFileTypes.join(", ")}
        beforeUpload={useBeforeUpload}
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
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
        onCancel={handleCancel}
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
    </div>
  );
};
