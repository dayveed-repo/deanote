import { queryDocumentEmbedding } from "@/app/lib/aiTransformation";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, noteId } = await req.json();

  if (!query || !noteId) {
    NextResponse.json(
      { error: "Required parameters are missing" },
      { status: 422 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ingestedEmbedding = await queryDocumentEmbedding(query, noteId);

    let answers = "";

    if (
      !ingestedEmbedding ||
      !ingestedEmbedding.results ||
      !ingestedEmbedding.results.length
    ) {
      NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    ingestedEmbedding.results?.forEach((res) => {
      if (res.content) {
        answers += res.content + "\n";
      }
    });

    if (!answers) {
      NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, answers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
