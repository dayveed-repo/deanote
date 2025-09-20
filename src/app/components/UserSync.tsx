"use client";
import React, { useEffect } from "react";

const UserSync = ({
  isAuthenticated,
  userData,
}: {
  isAuthenticated: Boolean;
  userData: {
    clerkId: String | undefined;
    email: String | undefined;
    fullName: string | undefined;
    profileImage: string | undefined;
    username: string | undefined;
  };
}) => {
  const syncUser = async () => {
    if (!userData || !userData.clerkId) return;

    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!data.success) {
      console.error("Failed to sync user:", data.error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userData && userData.clerkId) {
      syncUser();
    }
  }, [userData.clerkId]);

  return <></>;
};

export default UserSync;
