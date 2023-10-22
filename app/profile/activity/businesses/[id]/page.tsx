"use client";
import { Alert, Button, Skeleton, Space } from "antd";
import type { NextPage } from "next";

import { BusinessForm } from "@/components/.";
import { useBusinessAlbumImages, useErrorToaster } from "hooks";
import { trpc } from "trpc";
import type { BusinessService, Service } from "types";
import { EditAreas } from "./(editAreas)";
import { EditImages } from "./(editImages)";
import { EditOpeningHours } from "./(editOpeningHours)";
import { EditServices } from "./(editServices)";

type BusinessDetailsPageProps = { params: { id: string } };

const ProfileBusinessPage: NextPage<BusinessDetailsPageProps> = ({
  params,
}) => {
  const {
    data: business,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  } = trpc.business.useQuery(params.id);
  const albumImages = useBusinessAlbumImages(business);

  const contextHolder = useErrorToaster(
    isError,
    isSuccess,
    error?.message ?? "Error fetching business"
  );

  if (!business) {
    return (
      <div className="w-full sm:w-9/12 mx-auto my-6">
        {contextHolder}
        {isFetching ? (
          <div className="w-full sm:w-9/12 mx-auto flex flex-col gap-6">
            <br />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <br />
            <br />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Space size="large">
              <Skeleton.Button active size="large" />
              <Skeleton.Button active size="large" />
            </Space>
          </div>
        ) : (
          <Alert
            showIcon
            type="info"
            message="No business found"
            className="max-w-xl mx-auto"
          />
        )}
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col">
      {contextHolder}
      <div className="w-full sm:w-9/12 mx-auto flex flex-wrap justify-between">
        <p className="mb-5 text-2xl text-neutral-content">Edit Business</p>
        <Button
          size="large"
          type="default"
          className="custom-primary-button"
          href={`/businesses/${params.id}`}
        >
          Preview
        </Button>
      </div>
      <BusinessForm isEditing business={business} onSuccess={refetch} />
      <EditImages
        businessId={business.id}
        onSuccess={refetch}
        albumImages={albumImages}
      />
      <EditOpeningHours
        openingHours={business.openingHours}
        businessId={business.id}
        onSuccess={refetch}
      />
      <EditServices
        services={
          (business.expand["businessServices(business)"] ?? []).map(
            (bs: BusinessService) => bs.expand?.service
          ) as Service[]
        }
        businessId={business.id}
        onSuccess={refetch}
      />
      <EditAreas businessId={business.id} onSuccess={refetch} />
    </section>
  );
};

export default ProfileBusinessPage;
