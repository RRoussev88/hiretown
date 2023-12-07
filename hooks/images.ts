import { message } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { useMemo } from "react";

import { trpc } from "trpc";
import { Business, BusinessImage, ImageAlbum } from "types";
import { allowedFileTypes } from "utils";

export const useBusinessAlbumImages = (business?: Business) => {
  const {
    data: imagesData,
    isLoading,
    isSuccess: isImagesSuccess,
  } = trpc.businessImages.useQuery(business?.id ?? "", { enabled: !!business });

  return useMemo(() => {
    const map = new Map<ImageAlbum, BusinessImage[]>();

    if (!!business && isImagesSuccess && !isLoading) {
      business.expand["imageAlbums(business)"]?.forEach((album: ImageAlbum) => {
        const images = imagesData.items.filter(
          (image: BusinessImage) => image.album === album.id
        );
        map.set(album, images);
      });
    }

    return map;
  }, [business, isLoading, isImagesSuccess, imagesData]);
};

export const useBeforeUpload = (file: RcFile) => {
  const isAllowedType = allowedFileTypes.includes(file.type);
  if (!isAllowedType) {
    message.error("You can only upload JPG,PNG or GIF files!");
  }

  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error("Image must smaller than 5MB!");
  }

  return isAllowedType && isLt5M;
};