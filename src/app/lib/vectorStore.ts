import { MongoClient } from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { TaskType } from "@google/generative-ai";

const client = new MongoClient(process.env.MONGODB_URI!);
await client.connect();

const collection = client.db("test").collection("embeddingDocuments");

export async function deleteAllEmbeddings() {
  await client.connect();
  const db = client.db("test");
  const collection = db.collection("embeddingDocuments");

  await collection.deleteMany({}); // delete everything
  console.log("✅ All embeddings deleted");

  // await client.close();
}

// ✅ Use Gemini embeddings (via Google Generative AI)
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
});

export const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection,
  indexName: "default", // Atlas Vector Search index
  textKey: "text", // raw text field
  embeddingKey: "embedding", // vector field
});
