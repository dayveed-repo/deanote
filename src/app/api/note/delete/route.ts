import { deleteNote } from "@/app/lib/noteServices";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/app/lib/db";

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("noteId");

  try {
    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 422 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const note = await deleteNote(id);

    if (note.success) {
      return NextResponse.json({ success: true, note }, { status: 200 });
    }

    return NextResponse.json(
      { error: note.error || "Failed to delete" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
