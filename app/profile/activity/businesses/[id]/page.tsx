"use client";
import { Alert, Button, Skeleton, Space } from "antd";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";

import { BusinessForm } from "@/components/.";
import { useBusinessAlbumImages, useErrorToaster } from "hooks";
import { useEffect } from "react";
import { trpc } from "trpc";
import type { BusinessService, Service } from "types";
import { EditAreas } from "./(editAreas)";
import { EditAlbums } from "./(editAlbums)";
import { EditOpeningHours } from "./(editOpeningHours)";
import { EditServices } from "./(editServices)";
import { EditLinks } from "./(editLinks)";

type BusinessDetailsPageProps = { params: { id: string } };

const ProfileBusinessPage: NextPage<BusinessDetailsPageProps> = ({
  params,
}) => {
  const router = useRouter();

  const {
    data: hasPermission,
    isFetching: isFetchingPermission,
    isError: isPermissionError,
    error: permissionError,
    isSuccess: isPermissionSuccess,
  } = trpc.hasPermission.useQuery(params.id);

  const {
    data: business,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  } = trpc.business.useQuery(params.id, { enabled: hasPermission });
  const albumImages = useBusinessAlbumImages(business);

  const contextHolder = useErrorToaster(
    isError || isPermissionError,
    isSuccess || isPermissionSuccess,
    error?.message ?? permissionError?.message ?? "Error fetching business"
  );

  useEffect(() => {
    // Guard for editing other user's the businesses
    if (isPermissionSuccess && !hasPermission) {
      router.replace(`/businesses/${params.id}`);
    }
  }, [hasPermission, isPermissionSuccess, router, params.id]);

  if (!business) {
    return (
      <div className="w-full mx-auto my-6">
        {contextHolder}
        {isFetching || isFetchingPermission ? (
          <div className="w-full mx-auto flex flex-col gap-6">
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
    <section className="w-full flex flex-col text-primary-content">
      {contextHolder}
      <div className="w-full mx-auto flex flex-wrap justify-between">
        <p className="mb-5 text-2xl font-semibold">Edit Business</p>
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
      <EditAlbums
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
      <EditLinks
        businessId={business.id}
        onSuccess={refetch}
        links={business.expand["socialLinks(business)"] ?? []}
      />
    </section>
  );
};

export default ProfileBusinessPage;
