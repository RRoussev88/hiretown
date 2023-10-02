"use client";
import { Alert, Image, Skeleton, Space } from "antd";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

import {
  AreasSection,
  ContactsSection,
  OffersSection,
  OpeningHoursSection,
  ServicesSection,
  SocialLinksSection,
} from "@/components/.";
import { useBusinessAlbumImages, useToaster } from "hooks";
import { trpc } from "trpc";
import type { BusinessImage } from "types";
import { DEFAULT_ALBUM_NAME, FILES_URL } from "utils";

type BusinessDetailsPageProps = { params: { id: string } };

const BusinessDetailsPage: NextPage<BusinessDetailsPageProps> = ({
  params,
}) => {
  const [selectedImage, setSelectedImage] = useState<BusinessImage | null>(
    null
  );

  const {
    data: business,
    isFetching,
    isError,
    isSuccess,
    error,
  } = trpc.business.useQuery(params.id);

  const albumImages = useBusinessAlbumImages(business);

  const contextHolder = useToaster(
    isError,
    isSuccess,
    error?.message ?? "Error fetching business"
  );

  useEffect(() => {
    const defaultImages = Array.from(albumImages)?.find(
      ([album, _]) => album.name === DEFAULT_ALBUM_NAME
    )?.[1];
    setSelectedImage(
      defaultImages?.find((image) => image.isSelected) ??
        defaultImages?.[0] ??
        null
    );
  }, [albumImages]);

  if (!business) {
    return (
      <div className="max-w-xl mx-auto my-6">
        {isFetching ? (
          <div className="w-full mx-auto flex flex-col gap-6">
            <Skeleton.Input active size="large" block />
            <br />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <br />
            <Space size="large">
              <Skeleton.Image active />
              <Skeleton.Image active />
            </Space>
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
          </div>
        ) : (
          <Alert showIcon type="info" message="No business found" />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-6">
      <h2 className="mb-6 text-primary-focus text-4xl">{business.name}</h2>
      {contextHolder}
      <Image
        src={
          selectedImage
            ? `${FILES_URL}/${selectedImage.collectionId}/${selectedImage.id}/${selectedImage.image}?thumb=576x346`
            : "/mowing_guy.jpeg"
        }
        preview={false}
        className="mb-6 border border-slate-300 shadow rounded-md"
        alt="Business logo"
        width={576}
        height={346}
      />
      {Array.from(albumImages).map(([album, images]) => (
        <div
          key={album.id}
          className="border border-slate-300 shadow rounded-md p-2 my-6 w-full max-h-96 overflow-y-auto"
        >
          {album.name !== DEFAULT_ALBUM_NAME && (
            <p className="block pb-2 text-lg font-semibold text-neutral-content">
              {album.name}
            </p>
          )}
          <Image.PreviewGroup key={album.id}>
            {images.map((image) => (
              <Image
                id={`image-${image.id}`}
                key={image.id}
                src={`${FILES_URL}/${image.collectionId}/${image.id}/${image.image}?thumb=576x346`}
                alt="Business image"
                width={240}
                height={208}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      ))}
      {!!business.description && <p className="my-6">{business.description}</p>}
      <ContactsSection business={business} />
      {!!business.expand["businessServices(business)"]?.length && (
        <ServicesSection
          businessServices={business.expand["businessServices(business)"]}
        />
      )}
      {!!business.expand["offers(business)"]?.length && (
        <OffersSection offers={business.expand["offers(business)"]} />
      )}
      {!!business.expand["areas(business)"]?.length && (
        <AreasSection businessId={business.id} />
      )}
      {!!business.openingHours &&
        // Check if any of the days is an array containing all nonempty items
        Object.entries(business.openingHours).some(
          ([_, value]) => Array.isArray(value) && value.every(Boolean)
        ) && <OpeningHoursSection openingHours={business.openingHours} />}
      {!!business.expand["socialLinks(business)"]?.length && (
        <SocialLinksSection
          businessLinks={business.expand["socialLinks(business)"]}
        />
      )}
    </div>
  );
};

export default BusinessDetailsPage;
