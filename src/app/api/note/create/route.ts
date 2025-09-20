import { isValidURL } from "@/app/helper";
import { dbConnect } from "@/app/lib/db";

import User from "@/app/models/User";
import Note from "@/app/models/Note";
import { noteTypes } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";
import { processNoteDocument, processNoteLink } from "@/app/lib/noteServices";
import { deleteFileRefInBucket } from "@/app/lib/fileServices";

export async function POST(req: NextRequest) {
  try {
    const { fileBase64, title, type, link, clerkUserId } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Note 'title' is required" },
        { status: 422 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Note 'type' is required" },
        { status: 422 }
      );
    }

    if (!noteTypes.includes(type)) {
      return NextResponse.json(
        { error: `Note 'type' must be one of ${noteTypes.join(", ")}` },
        { status: 422 }
      );
    }

    let finalLink = (link || "").trim();
    let fileInfo = null,
      fileRef = null,
      fileUrl = null;

    if (type === "link") {
      if (!link) {
        return NextResponse.json(
          { error: "Note 'link' is required for link type notes" },
          { status: 422 }
        );
      }

      if (!isValidURL(finalLink)) {
        return NextResponse.json(
          { error: "Note 'link' must be a valid URL" },
          { status: 422 }
        );
      }

      const processedLink = await processNoteLink(finalLink, title);
      // return NextResponse.json({ success: true }, { status: 201 });
      if (processedLink?.error) {
        return NextResponse.json(
          { error: processedLink.error },
          { status: 422 }
        );
      }

      fileInfo = {
        fileType: processedLink.mimeType || "",
        fileSizeInBytes: processedLink.sizeInBytes || 0,
      };

      fileRef = { fileRef: processedLink.fileRef };
      fileUrl = { url: processedLink.fileUrl };
    }

    if (type === "document") {
      if (!fileBase64) {
        return NextResponse.json(
          { error: "Note 'fileBase64' is required for document type notes" },
          { status: 422 }
        );
      }

      // Extract file information
      const processedBase64 = await processNoteDocument(fileBase64, title);
      if (processedBase64.error) {
        return NextResponse.json(
          { error: processedBase64.error },
          { status: 422 }
        );
      }

      fileInfo = {
        fileType: processedBase64.fileType || "",
        fileSizeInBytes: processedBase64.sizeInBytes || 0,
      };

      fileRef = { fileRef: processedBase64.fileRef };
      fileUrl = { url: processedBase64.fileUrl };
    }

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unable to verify user information" },
        { status: 422 }
      );
    }

    await dbConnect();

    const user = await User.findOne(
      { clerkId: clerkUserId },
      { email: 1, _id: 1 }
    );

    if (!user || !user._id) {
      await deleteFileRefInBucket(fileRef?.fileRef);
      return NextResponse.json(
        { error: "Failed to verify user information" },
        { status: 401 }
      );
    }

    // return NextResponse.json({ success: true }, { status: 201 });

    // Create nwe note
    const newNote = await Note.create({
      title,
      type,
      linkUrl: finalLink,
      fileUrl: fileUrl?.url || "",
      fileRef: fileRef?.fileRef || "",
      fileType: fileInfo?.fileType || "",
      fileSizeInBytes: fileInfo?.fileSizeInBytes || 0,
      clerkUserId,
      user: user._id,
    });

    if (!newNote || !newNote._id) {
      await deleteFileRefInBucket(fileRef?.fileRef);
      return NextResponse.json(
        { error: "Failed to create note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, note: newNote }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create note: ${error}` },
      { status: 500 }
    );
  }
}
