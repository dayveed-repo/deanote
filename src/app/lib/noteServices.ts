import path from "path";
import { isValidURL } from "../helper";
import {
  convertFilePathToBase64,
  convertTextToFile,
  deleteFileRefInBucket,
  extractFileInfo,
  getFileRef,
  getFileURL,
} from "./fileServices";
import { extractTextWithPuppeteer } from "./linkService";
import fs from "fs";
import Note from "../models/Note";
import { dbConnect } from "./db";

export const processNoteLink = async (link: string, title: string) => {
  try {
    if (!link) return { error: "Link is required" };
    if (!title) return { error: "Title is required" };

    if (!isValidURL(link)) {
      return { error: "Link must be a valid URL" };
    }

    const refinedTitle = title.toLowerCase().trim().replaceAll(" ", "_");

    const extractedText = await extractTextWithPuppeteer(link);
    // console.log(extractedText);

    // return {
    //   success: true,
    //   fileUrl: "",
    //   fileRef: "",
    //   mimeType: "",
    //   sizeInBytes: "",
    // };
    const filePath = await convertTextToFile(
      extractedText,
      `${refinedTitle}.txt`
    );
    const base64OfFile = await convertFilePathToBase64(filePath);
    const extractedFileInfo = extractFileInfo(base64OfFile);

    fs.unlinkSync(filePath);

    const fileStorageRef = await getFileRef(refinedTitle, base64OfFile);

    if (fileStorageRef?.error) {
      return { error: fileStorageRef.error };
    }

    const fileUrl = await getFileURL(fileStorageRef.fileRef);

    if (fileUrl.error) {
      return { error: fileUrl.error };
    }

    return {
      success: true,
      fileUrl: fileUrl.url,
      fileRef: fileStorageRef.fileRef,
      mimeType: extractedFileInfo.mimeType,
      sizeInBytes: extractedFileInfo.sizeInBytes,
    };
  } catch (error) {
    console.log({ error: "Error occured in link process service " + error });
    return { error: "Error occured in link process service" };
  }
};

export const processNoteDocument = async (
  fileBase64: string,
  title: string
) => {
  try {
    const fileData = extractFileInfo(fileBase64);
    if (fileData.error) {
      return { error: fileData.error };
    }

    const fileInfo = {
      fileType: fileData.mimeType || "",
      fileSizeInBytes: fileData.sizeInBytes || 0,
    };

    if (fileInfo.fileSizeInBytes > 10 * 1024 * 1024) {
      return { error: "File size exceeds the maximum limit of 10MB" };
    }

    // Get file reference
    const fileRef = await getFileRef(title, fileBase64);

    if (fileRef?.error) {
      return { error: fileRef.error };
    }

    // Get file URL
    const fileUrl = await getFileURL(fileRef.fileRef);

    if (fileUrl?.error) {
      return { error: fileUrl.error };
    }

    return {
      success: true,
      fileUrl: fileUrl.url,
      fileRef: fileRef.fileRef,
      fileType: fileInfo.fileType,
      sizeInBytes: fileInfo.fileSizeInBytes,
    };
  } catch (error) {
    console.log({ error: "Error occured in link process service " + error });
    return { error: "Error occured in document process service" };
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    if (!noteId) {
      return { error: "Note Id is missing" };
    }

    await dbConnect();

    const note = await Note.findById(noteId);

    if (!note || !note._id) {
      return { error: "Note not found" };
    }

    if (note.type === "link" || note.type === "document") {
      const deletedRes = await deleteFileRefInBucket(note?.fileRef);

      if (deletedRes.error) {
        return { error: "An error occured while deleting file ref" };
      }
    }

    const response = await Note.deleteOne({ _id: noteId });
    if (response.deletedCount) {
      return { success: true };
    }

    return { error: "Failed to delete note" };
  } catch (error) {
    return { error: "An error occured while deleting Note: " + error };
  }
};
