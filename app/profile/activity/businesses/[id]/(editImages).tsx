import { type FC } from "react";

import { useErrorToaster } from "hooks";
import { AlbumImages } from "./(albumImages)";
import { trpc } from "trpc";
import { BusinessImage, ImageAlbum, ImageUploadPayload } from "types";

type EditImagesProps = {
  businessId: string;
  albumImages: Map<ImageAlbum, BusinessImage[]>;
  onSuccess?: () => void;
};

export const EditImages: FC<EditImagesProps> = ({
  businessId,
  albumImages,
  onSuccess,
}) => {
  const { mutate, isLoading, isSuccess, isError, error } =
    trpc.updateBusinessImages.useMutation({ onSuccess });

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error saving images"
  );

  const handleSave = (
    albumId: string,
    imagePayloads: ImageUploadPayload[],
    deleteImages: string[]
  ) => mutate({ businessId, albumId, imagePayloads, deleteImages });

  return (
    <section className="w-full pt-12">
      <h4 className="section-title">Images</h4>
      {contextHolder}
      {Array.from(albumImages).map(([album, images]) => (
        <AlbumImages
          key={album.id}
          album={album}
          images={images}
          isLoading={isLoading}
          onSave={handleSave}
        />
      ))}
    </section>
  );
};
