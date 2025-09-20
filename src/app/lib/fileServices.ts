import { v4 as uuidv4 } from "uuid";
import {
  deleteObject,
  getBlob,
  getDownloadURL,
  ref,
  StorageReference,
  uploadString,
} from "firebase/storage";
import { adminBucket, storageBucket } from "../config/firebase";
import fs from "fs";
import path from "path";
import PDFParser from "pdf2json";

export function convertFilePathToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  let fileString = fileBuffer.toString("base64");

  return `data:text/plain;base64,${fileString}`;
}

export const convertTextToFile = (text: string, filename: string): string => {
  const dirPath = path.join(__dirname, "tmp");
  const filePath = path.join(dirPath, filename); // Safe for serverless platforms too

  // check existing dir
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  fs.writeFileSync(filePath, text);
  return filePath;
};

// Get URL from firebase
export const getFileURL = async (ref: StorageReference | undefined) => {
  if (!ref) {
    return { error: "File reference is required." };
  }
  // Get the download URL for the file
  const url = await getDownloadURL(ref);
  if (!url) {
    return { error: "Failed to get file URL" };
  }
  return { url };
};

// GET File Ref for file
export const getFileRef = async (fileName: string, fileBase64: string) => {
  if (!fileName || !fileBase64) {
    return { error: "Filename or File base64 is required." };
  }

  let uniqueId = uuidv4();
  const firebaseBucketRef = ref(
    storageBucket,
    `deanote_files/${fileName.toLowerCase().replaceAll(" ", "_")}_${uniqueId}`
  );

  const fileRef = (
    await uploadString(firebaseBucketRef, fileBase64, "data_url")
  ).ref;

  return { fileRef };
};

export const getFileRefBlob = async (ref: StorageReference | undefined) => {
  if (!ref) return { error: "Firebase storage ref is required" };

  const blob = await getBlob(ref);
  if (!blob) {
    return { error: "Failed process file blob" };
  }

  return { blob };
};

// Remove file from storage bucket
export const deleteFileRefInBucket = async (
  ref: StorageReference | undefined
) => {
  if (!ref || typeof ref !== "string")
    return { error: "Firebase storage ref is required" };
  let error = "";

  // @ts-ignore
  const filePath = ref?.split(`com/`)[1];

  // await deleteObject(filePath)
  adminBucket
    .file(filePath)
    .delete()
    .then(() => {
      console.log("File deleted successfully: " + ref);
    })
    .catch((error: any) => {
      console.log({ error: "Error deleting file from firebase: " + error });
      error = "Error deleting file" + error;
    });

  if (!error) return { success: true };

  return { error };
};

export function extractFileInfo(base64String: string) {
  const [prefix, base64Data] = base64String.split(",");
  const mimeMatch = prefix.match(/data:(.*);base64/);

  if (!mimeMatch || !base64Data) {
    return {
      error: "Invalid base64 string format",
    };
  }

  const mimeType = mimeMatch[1];
  const sizeInBytes =
    (base64Data.length * 3) / 4 -
    (base64Data.endsWith("==") ? 2 : base64Data.endsWith("=") ? 1 : 0);

  return {
    mimeType,
    sizeInBytes,
  };
}

export async function extractPDFText(arrayBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((t) =>
          decodeURIComponent(t.R.map((r) => r.T).join(""))
        ).join(" ")
      ).join("\n\n");
      resolve(text);
    });

    pdfParser.parseBuffer(arrayBuffer);
  });
}
