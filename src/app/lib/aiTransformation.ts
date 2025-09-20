import { vectorStore } from "./vectorStore";

export async function ingestFileText(docs: any) {
  if (!docs) return { error: "Missing text content" };

  const store = await vectorStore;
  const res = await store.addDocuments(docs);

  if (!res || !Array.isArray(res)) {
    return { error: "Failed to save embedding" };
  }

  return { success: true, documents: res };
}

export async function queryDocumentEmbedding(query: string, noteId: string) {
  if (!query) {
    return { error: "Query is required" };
  }

  const store = await vectorStore;
  const results = await store.similaritySearch(query, 2, { noteId });

  if (!results || !Array.isArray(results)) {
    return { error: "Failed to retrieve response" };
  }

  return {
    success: true,
    results: results.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
    })),
  };
}
