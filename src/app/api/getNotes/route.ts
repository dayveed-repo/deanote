import { dbConnect } from "@/app/lib/db";
import Note from "@/app/models/Note";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const clerkId = searchParams.get("clerkId");
    const type = searchParams.get("type");
    const title = searchParams.get("title");

    if (!clerkId) {
      return NextResponse.json(
        { error: "Clerk ID is required" },
        { status: 422 }
      );
    }

    let query = {};

    if (type && type !== "all") {
      query = { type };
    }

    if (title) {
      query = { ...query, title: { $regex: title, $options: "i" } };
    }

    await dbConnect();
    const notes = await Note.find({ clerkUserId: clerkId, ...query }).select(
      "title type updatedAt createdAt"
    );

    if (notes && Array.isArray(notes)) {
      return NextResponse.json({ success: true, notes }, { status: 200 });
    }

    return NextResponse.json(
      { error: "No notes found for this User" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in getNotes route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
