"use client";
import { Alert, Image, Skeleton, Space } from "antd";
import type { NextPage } from "next";
import NextImage from "next/image";

import {
  AreasSection,
  ContactsSection,
  OffersSection,
  OpeningHoursSection,
  ServicesSection,
  SocialLinksSection,
} from "@/components/.";
import { useBusinessAlbumImages, useErrorToaster } from "hooks";
import { trpc } from "trpc";
import { DEFAULT_ALBUM_NAME, FILES_URL } from "utils";

type BusinessDetailsPageProps = { params: { id: string } };

const BusinessDetailsPage: NextPage<BusinessDetailsPageProps> = ({
  params,
}) => {
  const {
    data: business,
    isFetching,
    isError,
    isSuccess,
    error,
  } = trpc.business.useQuery(params.id);

  const albumImages = useBusinessAlbumImages(business);

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error fetching business"
  );

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {isFetching ? (
          <div className="w-full flex flex-col gap-6">
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
    <div className="w-full max-w-4xl mx-auto text-primary-content p-3 sm:p-6">
      <h2 className="mb-6 text-primary-focus text-4xl">{business.name}</h2>
      {contextHolder}
      <NextImage
        src={
          business.thumbnail
            ? `${FILES_URL}/${business.collectionId}/${business.id}/${business.thumbnail}?thumb=896x538`
            : "/mowing_guy.jpeg"
        }
        height={896}
        width={538}
        className="mb-3 mx-auto sm:mb-6 border border-slate-300 shadow rounded-md"
        alt="Business logo"
      />
      {Array.from(albumImages)
        .filter(([_, images]) => images.length)
        .map(([album, images]) => (
          <div
            key={album.id}
            className="border border-slate-300 shadow rounded-md p-2 mb-3 sm:mb-6 w-full max-h-96 overflow-y-auto"
          >
            {album.name !== DEFAULT_ALBUM_NAME && (
              <p className="block pb-2 text-lg font-semibold text-primary-content">
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
      {(business.address ||
        business.contactEmail ||
        business.contactPhone ||
        business.contactWebsite) && <ContactsSection business={business} />}
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
      <div className="w-full flex flex-col md:flex-row gap-3">
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
    </div>
  );
};

export default BusinessDetailsPage;
