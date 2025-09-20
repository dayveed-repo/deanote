import { dbConnect } from "@/app/lib/db";
import Note from "@/app/models/Note";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { noteId, title, content } = await req.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 422 }
      );
    }
    if (!title) {
      return NextResponse.json(
        { error: "Note Title cannot be empty" },
        { status: 422 }
      );
    }

    await dbConnect();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateRes = await Note.findByIdAndUpdate(noteId, { title, content });

    if (!updateRes || !updateRes._id) {
      return NextResponse.json(
        { error: "Note update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Note updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in edit note route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
