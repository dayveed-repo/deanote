"use client";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { IoIosCloudDone } from "react-icons/io";
import { GiPoisonCloud } from "react-icons/gi";
import { SlReload } from "react-icons/sl";
import toast, { Toaster } from "react-hot-toast";
import { saveAs } from "file-saver";
import DeleteModal from "./DeleteModal";
import { useRouter } from "next/navigation";
import { LuTrash, LuTrash2 } from "react-icons/lu";

const NoteHeader = ({
  note,
  setNote,
  saveError,
  savingData,
  lastUpdateTime,
  setRetry,
}: {
  note: { [key: string]: any } | null;
  setNote: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    } | null>
  >;
  savingData: boolean;
  saveError: string;
  lastUpdateTime: string | null;
  setRetry: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [title, settitle] = useState(note?.title || "");
  const [downloadingFile, setdownloadingFile] = useState(false);
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const [downloadingContent, setdownloadingContent] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadNoteSource = async () => {
    if (!note?.fileUrl || !["link", "document"].includes(note?.type)) {
      return toast.error("Note source is not available for this note type");
    }

    setdownloadingFile(true);

    const loadedImageRes = await fetch("/api/fileblob", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ fileUrl: note.fileUrl || "" }),
    });

    let fileRes = await loadedImageRes.json();
    let filebase64 = fileRes.filebase64 || "";

    if (!filebase64) {
      toast.error("An error occured while downloading note source");
      return setdownloadingFile(false);
    }

    try {
      let extention = note.fileType?.split("/")[1] || "";
      saveAs(filebase64, `${note.title}_source` || "note-source");
      setdownloadingFile(false);
    } catch (error) {
      console.log(error);
      toast.error("An error occured while downloading note source");
      setdownloadingFile(false);
    }
  };

  const downloadContent = async () => {
    if (!note?._id || !note.content) {
      return toast.error("Note content is not available");
    }

    try {
      setdownloadingContent(true);

      const loadedImageRes = await fetch("/api/downloadContent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ html: note.content || "" }),
      });

      let fileRes = await loadedImageRes.json();
      let filebase64 = fileRes?.base64 || "";

      if (!filebase64) {
        toast.error("Failed to download content");
        return setdownloadingContent(false);
      }
      saveAs(filebase64, `${note.title}_content` || "note-content");
      setdownloadingContent(false);
    } catch (error) {
      console.log(error);
      toast.error("An error occured while downloading ncontent");
      setdownloadingContent(false);
    }
  };

  return (
    <div className="w-full md:flex justify-between">
      <Toaster />
      <div className="flex-grow">
        <input
          ref={inputRef}
          type="text"
          value={title}
          className="bg-transparent outline-none md:max-w-[800px] focus-within:border focus-within:border-purple-300 focus-within:px-2 py-[2px] rounded-md text-lg font-medium mb-2"
          onChange={(e) => {
            settitle(e.target.value);
            setNote({ ...(note || {}), title: e.target.value });
          }}
          style={{
            width: `${Math.max(title.length, 30)}%`,
          }}
        />

        {savingData ? (
          <div className="flex items-center space-x-2">
            <span className="loader border-t-2 border-purple-500 rounded-full w-4 h-4 animate-spin"></span>
            <span className="text-xs text-[var(--foreground-secondary)]">
              Saving...
            </span>
          </div>
        ) : (
          <div className="w-full flex space-x-4">
            <p className="text-xs font-bold text-[var(--foreground-secondary)]">
              Last Update:{" "}
              <span className="font-medium">
                {moment(lastUpdateTime || note?.updatedAt || "").format(
                  "DD, MMM YYYY - HH:mm"
                )}
              </span>
            </p>

            <div className="flex space-x-1">
              {saveError ? (
                <>
                  <GiPoisonCloud className="text-red-500 text-md" />
                  <p className="text-xs text-red-500">{saveError}</p>

                  <SlReload
                    onClick={() => setRetry(Math.random())}
                    className={`text-gray-500 cursor-pointer ${
                      savingData ? "animate-spin duration-[1500ms]" : ""
                    }`}
                  />
                </>
              ) : (
                <IoIosCloudDone className="text-[var(--primary)] text-sm" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 md:mt-0 mt-4">
        {["link", "document"].includes(note?.type) && (
          <button
            className={`${
              downloadingFile || downloadingContent ? "opacity-50" : ""
            } button-secondary text-xs`}
            onClick={downloadNoteSource}
            disabled={downloadingFile || downloadingContent}
          >
            {downloadingFile ? "Downloading..." : "Download Note Source"}
          </button>
        )}

        <button
          disabled={downloadingFile || downloadingContent}
          className={`button text-xs ${
            downloadingFile || downloadingFile ? "opacity-50" : ""
          }`}
          onClick={downloadContent}
        >
          {downloadingContent ? "Downloading..." : "Download Note"}
        </button>

        <LuTrash2
          className="text-xl  transition-all hover:scale-110 hover:text-red-500 cursor-pointer"
          onClick={() => setisDeleteOpen(true)}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteOpen}
        noteId={note?._id}
        noteTitle={note?.title}
        onClose={() => setisDeleteOpen(false)}
        onSuccess={() => {
          router.replace("/dashboard");
        }}
      />
    </div>
  );
};

export default NoteHeader;
