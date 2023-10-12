"use client";
import type { NextPage } from "next";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "context/AuthContext";
import { trpc } from "trpc";
import { FILES_URL, StorageKeys } from "utils";
import { EditAvatar } from "./(editAvatar)";
import { EditTextProperty } from "./(editTextProperty)";
import { ImageUploadPayload } from "types";

const ProfileOverviewPage: NextPage = () => {
  const [editedProperty, setEditedProperty] = useState("");
  const { isLoading, error, mutate, reset } = trpc.updateUser.useMutation({
    onSuccess: () => setEditedProperty(""),
  });
  const { [StorageKeys.CURRENT_USER]: user } = useContext(AuthContext);

  const handleUpdate = async (
    property: string,
    value: string | ImageUploadPayload
  ) => {
    if (!user) return;
    mutate({ userId: user.id, property, value });
  };

  useEffect(() => {
    !editedProperty && reset();
  }, [editedProperty, reset]);

  return (
    <section className="w-full flex flex-col">
      <p className="mb-5 text-2xl text-neutral-content">Profile Overview</p>
      <article className="w-full sm:w-9/12 mx-auto">
        <EditAvatar
          errorMessage={editedProperty === "Avatar" ? error?.message ?? "" : ""}
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
        <EditTextProperty
          propertyName="Email"
          initialValue={user?.email}
          onSaveProperty={handleUpdate}
          isLoading={isLoading}
          errorMessage={error?.message ?? ""}
          editedProperty={editedProperty}
          setEditedProperty={setEditedProperty}
        />
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
