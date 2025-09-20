import React from "react";
import Logo from "./Logo";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import UserSync from "./UserSync";

const Navbar = async () => {
  const user = await auth();
  const currentUserData = await currentUser();

  const updatePayload = {
    clerkId: currentUserData?.id,
    email: currentUserData?.primaryEmailAddress?.emailAddress,
    fullName: `${currentUserData?.firstName || ""} ${
      currentUserData?.lastName || ""
    }`.trim(),
    profileImage: currentUserData?.imageUrl || "",
    username: currentUserData?.username || "",
  };

  return (
    <div className="w-full px-4 py-4">
      <UserSync
        isAuthenticated={user.isAuthenticated}
        userData={updatePayload}
      />
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Logo />

        {user?.isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <UserButton />

            <Link href="/dashboard">
              <button className="button">Dashboard</button>
            </Link>
          </div>
        ) : (
          <div className="space-x-5">
            <SignUpButton mode="modal">
              <button className="button">Get Started</button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="button-secondary">Login</button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
