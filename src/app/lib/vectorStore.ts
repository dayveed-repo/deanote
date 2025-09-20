import { MongoClient } from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { TaskType } from "@google/generative-ai";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your environment");
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Reuse client across hot reloads / serverless functions
if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getCollection() {
  const client = await clientPromise;
  return client.db("test").collection("embeddingDocuments");
}

export async function deleteAllEmbeddings() {
  const collection = await getCollection();
  await collection.deleteMany({});
  console.log("✅ All embeddings deleted");
}

// ✅ Use Gemini embeddings (via Google Generative AI)
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
});

export const vectorStore = (async () => {
  const collection = await getCollection();

  return new MongoDBAtlasVectorSearch(embeddings, {
    collection,
    indexName: "default", // Atlas Vector Search index
    textKey: "text", // raw text field
    embeddingKey: "embedding", // vector field
  });
})();
