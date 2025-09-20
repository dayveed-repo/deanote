import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/User";
import { dbConnect } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { clerkId, email, fullName, profileImage, username } =
      await req.json();

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 422 }
      );
    }

    const dbRes = await dbConnect();

    const user = await User.findOneAndUpdate(
      { clerkId },
      { clerkId, email, fullName, profileImage, username },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create or update user: ${error}` },
      { status: 500 }
    );
  }
}
