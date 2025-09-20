import { auth, currentUser } from "@clerk/nextjs/server";
import React from "react";
import UserSync from "./UserSync";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { UserButton } from "@clerk/nextjs";

type UserData = {
  clerkId: string | undefined;
  email: string | undefined;
  fullName: string | undefined;
  profileImage: string | undefined;
  username: string | undefined;
};

const DashboardNavbar = async () => {
  let user,
    currentUserData,
    updatePayload: UserData = {
      clerkId: undefined,
      email: undefined,
      fullName: undefined,
      profileImage: undefined,
      username: undefined,
    };
  try {
    // Ensure the user is authenticated
    user = await auth();
    currentUserData = await currentUser();

    updatePayload = {
      clerkId: currentUserData?.id,
      email: currentUserData?.primaryEmailAddress?.emailAddress,
      fullName: `${currentUserData?.firstName || ""} ${
        currentUserData?.lastName || ""
      }`.trim(),
      profileImage: currentUserData?.imageUrl || "",
      username: currentUserData?.username || "",
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return <></>;
  }

  return (
    <div className="w-full py-2 bg-white shadow-sm px-5">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between ">
        <UserSync
          isAuthenticated={user.isAuthenticated}
          userData={updatePayload}
        />

        <Logo />

        <div className="md:block hidden w-[60%] max-w-[500px]">
          <SearchBar />
        </div>

        {user?.isAuthenticated && (
          <div className="flex items-center space-x-2">
            <UserButton />
            <p className="text-[var(--foreground-secondary)] text-sm font-medium">
              Hello, {currentUserData?.fullName}
            </p>
          </div>
        )}
      </div>

      <div className="md:hidden w-full mx-auto mt-3">
        <SearchBar />
      </div>
    </div>
  );
};

export default DashboardNavbar;
