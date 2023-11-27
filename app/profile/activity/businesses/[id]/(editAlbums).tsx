import { Button, Form, Input } from "antd";
import { type FC } from "react";

import { useErrorToaster } from "hooks";
import { trpc } from "trpc";
import { BusinessImage, ImageAlbum } from "types";
import { AlbumImages } from "./(albumImages)";

type EditAlbumsProps = {
  businessId: string;
  albumImages: Map<ImageAlbum, BusinessImage[]>;
  onSuccess?: () => void;
};

export const EditAlbums: FC<EditAlbumsProps> = ({
  businessId,
  albumImages,
  onSuccess,
}) => {
  const [albumForm] = Form.useForm();
  const formValues = Form.useWatch([], albumForm);

  const { mutate, isLoading, isSuccess, isError, error } =
    trpc.createImageAlbum.useMutation({
      onSuccess: () => {
        albumForm.resetFields();
        onSuccess?.();
      },
    });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error saving image album"
  );

  const handleAlbumSave = () =>
    mutate({
      businessId,
      albumName: formValues?.albumName,
      albumDescription: formValues?.albumDescription,
    });

  return (
    <section className="w-full pt-12">
      <h4 className="section-title">Image Albums</h4>
      {contextHolder}
      <Form
        form={albumForm}
        layout="vertical"
        size="large"
        className="w-full"
        disabled={isLoading}
      >
        <Form.Item
          required
          name="albumName"
          rules={[{ required: true, message: "Album name is required!" }]}
        >
          <Input
            aria-required
            type="text"
            name="albumName"
            placeholder="Album name"
          />
        </Form.Item>
        <Form.Item name="albumDescription">
          <Input.TextArea
            name="albumDescription"
            placeholder="Album description"
          />
        </Form.Item>
        <Button
          size="large"
          type="default"
          htmlType="submit"
          loading={isLoading}
          disabled={!formValues?.albumName || isLoading}
          className="custom-primary-button mb-6"
          onClick={handleAlbumSave}
        >
          Create Album
        </Button>
      </Form>
      <article className="flex flex-col gap-4">
        {Array.from(albumImages).map(([album, images]) => (
          <AlbumImages
            key={album.id}
            album={album}
            images={images}
            onSuccess={onSuccess}
          />
        ))}
      </article>
    </section>
  );
};
