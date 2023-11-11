"use client";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { NextPage } from "next";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "context/AuthContext";
import { trpc } from "trpc";
import { ImageUploadPayload } from "types";
import { FILES_URL, StorageKeys } from "utils";
import { EditAvatar } from "./(editAvatar)";
import { EditTextProperty } from "./(editTextProperty)";
import { useSuccessToaster } from "hooks";

const ProfileOverviewPage: NextPage = () => {
  const [editedProperty, setEditedProperty] = useState("");
  const { isLoading, error, mutate, reset } = trpc.updateUser.useMutation({
    onSuccess: () => setEditedProperty(""),
  });
  const { mutate: requestVerification, isSuccess: isRequestSuccess } =
    trpc.requestEmailVerification.useMutation();
  const { mutate: requestPasswordChange, isSuccess: isPassRequestSuccess } =
    trpc.requestEmailVerification.useMutation();
  const { [StorageKeys.CURRENT_USER]: user } = useContext(AuthContext);

  const handleUpdate = async (
    property: string,
    value: string | ImageUploadPayload
  ) => {
    if (!user) return;
    mutate({ userId: user.id, property, value });
  };

  const successContext = useSuccessToaster(
    isRequestSuccess,
    `Verification email sent to ${user?.email}`
  );

  const passSuccessContext = useSuccessToaster(
    isPassRequestSuccess,
    `Change password email sent to ${user?.email}`
  );

  useEffect(() => {
    !editedProperty && reset();
  }, [editedProperty, reset]);

  return (
    <section className="w-full flex flex-col text-primary-content">
      <p className="w-full mb-5 text-2xl font-semibold">Profile Overview</p>
      <article className="w-full flex flex-col gap-6">
        <div className="flex justify-between flex-wrap gap-6">
          <div className="text-base sm:text-lg flex flex-col gap-6">
            {user?.verified ? (
              <p className="flex gap-3 items-baseline">
                <span>Email&nbsp;verified</span>
                <CheckCircleOutlined className="text-success text-3xl" rev="" />
              </p>
            ) : (
              <Button
                className="custom-primary-button"
                size="large"
                onClick={() => {
                  requestVerification(user?.email ?? "");
                }}
              >
                {successContext}
                Send&nbsp;verification&nbsp;email
              </Button>
            )}
            <Button
              className="custom-primary-button"
              size="large"
              onClick={() => {
                requestPasswordChange(user?.email ?? "");
              }}
            >
              {passSuccessContext}
              Change&nbsp;password
            </Button>
          </div>
          <EditAvatar
            errorMessage={
              editedProperty === "Avatar" ? error?.message ?? "" : ""
            }
            initialValue={
              !!user?.avatar
                ? `${FILES_URL}/${user.collectionId}/${user.id}/${user.avatar}?thumb=100x100`
                : ""
            }
            isLoading={isLoading}
            editedProperty={editedProperty}
            onSaveProperty={handleUpdate}
            setEditedProperty={setEditedProperty}
          />
        </div>
        <EditTextProperty
          propertyName="Name"
          initialValue={user?.name}
          onSaveProperty={handleUpdate}
          isLoading={isLoading}
          errorMessage={error?.message ?? ""}
          editedProperty={editedProperty}
          setEditedProperty={setEditedProperty}
        />
      </article>
    </section>
  );
};

export default ProfileOverviewPage;
