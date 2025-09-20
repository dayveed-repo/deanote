import { blobToBase64 } from "@/app/helper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();

    const textToImageResponse = await fetch(fileUrl);

    // ---- gets the blob and converts to base64 ---
    const imageBlob = await textToImageResponse.blob();
    const filebase64 = await blobToBase64(imageBlob);

    if (!filebase64) {
      console.log("Image base64 conversion failed");
      return NextResponse.json(
        { error: "Failed to initiate download" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        filebase64,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal Error:", error);
    // Handle other errors (e.g., network issues, parsing errors)
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
