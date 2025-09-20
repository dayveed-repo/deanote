import { dbConnect } from "@/app/lib/db";
import { deleteAllEmbeddings } from "@/app/lib/vectorStore";
import Note from "@/app/models/Note";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("noteId");

  try {
    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 422 }
      );
    }

    // deleteAllEmbeddings();

    await dbConnect();
    const note = await Note.findById(id).populate("user", "name email");

    if (!note || !note._id) {
      console.log("Note not found", note);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, note }, { status: 200 });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
