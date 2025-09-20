import { extractPDFText } from "@/app/lib/fileServices";
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ingestFileText } from "@/app/lib/aiTransformation";
import { deleteNote } from "@/app/lib/noteServices";

const acceptTypes = ["pdf", "doc", "docx", "txt"];

export async function POST(req: NextRequest) {
  try {
    const {
      fileUrl = "",
      type = "",
      fileType = "",
      noteId = "",
      userId = "",
      clerkUserId = "",
    } = await req.json();

    if (!fileUrl || !type) {
      return NextResponse.json(
        { error: "File Url and note type are required" },
        { status: 401 }
      );
    }

    if (!acceptTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "File type must be either pdf | docx | txt" },
        { status: 401 }
      );
    }

    if (!noteId || !userId || !clerkUserId) {
      await deleteNote(noteId);
      return NextResponse.json(
        { error: "Note Id, user Id, Clerk Id are required" },
        { status: 401 }
      );
    }

    const response = await fetch(fileUrl);

    if (!response?.ok) {
      await deleteNote(noteId);
      return NextResponse.json(
        { error: "Failed to obtain data for processing" },
        { status: 422 }
      );
    }

    let text;
    if (fileType === "pdf") {
      const buffer = await response?.arrayBuffer();
      const convertedBuffer = Buffer.from(buffer);

      text = await extractPDFText(convertedBuffer);
      console.log({ text });
    } else if (fileType === "txt") {
      text = await response.text();
    } else if (fileType === "doc") {
      const arrayBuffer = await response?.arrayBuffer();
      // @ts-ignore
      const textTemp = await mammoth.extractRawText({ buffer: arrayBuffer });
      text = textTemp.value;
    }

    if (!text) {
      await deleteNote(noteId);
      return NextResponse.json(
        { error: "Unable to proccess file blob" },
        { status: 422 }
      );
    }

    const splitters = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });

    const metadata = {
      noteId,
      userId,
      clerkUserId,
    };

    const output = await splitters.createDocuments([text], [metadata]);
    const ingestedEmbedding = await ingestFileText(output);

    if (ingestedEmbedding?.error) {
      await deleteNote(noteId);
      return NextResponse.json(
        { error: "Failed to save vector documents" },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // await deleteNote(noteId);
    //  if (noteId) {
    //    await deleteNote(noteId);
    //  }
    return NextResponse.json(
      { error: "An Error occured while saving note embedding" + error },
      { status: 500 }
    );
  }
}
