"use client";
import ErrorIcon from "@/app/components/ErrorIcon";
import NoteHeader from "@/app/components/note/NoteHeader";
import Tiptap from "@/app/components/TipTapEditor";
import moment from "moment";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";

const Note = () => {
  const { id } = useParams();
  const [note, setnote] = useState<{ [key: string]: any } | null>(null);
  const [error, seterror] = useState("");
  const [fetchingNote, setfetchingNote] = useState(false);
  const [saving, setsaving] = useState(false);
  const [saveError, setsaveError] = useState("");
  const [lastUpdateTime, setlastUpdateTime] = useState<null | string>(null);
  const [retry, setretry] = useState(0);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchNote = async () => {
    if (!id) {
      // console.error("Note ID is required");
      return;
    }

    setfetchingNote(true);
    try {
      const response = await fetch(`/api/note/get?noteId=${id}`);
      const data = await response.json();

      if (data.success) {
        // Handle the fetched note data
        setnote(data.note);
        setfetchingNote(false);
      } else {
        seterror(data.error);
        setfetchingNote(false);
        console.error("Error fetching note:", data.error);
      }
    } catch (error) {
      setfetchingNote(false);
      console.error("Error fetching note:", error);
    }
  };

  const saveNote = async () => {
    if (!note || !note._id) return;

    setsaving(true);
    setsaveError("");

    await fetch("/api/note/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        noteId: note._id,
        content: note.content,
        title: note.title,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          console.log({ saveError: error });
          setsaveError("Failed to save note");
        } else {
          setlastUpdateTime(moment().toISOString());
        }
        setsaving(false);
      })
      .catch((err) => {
        setsaveError("Error saving note");
        setsaving(false);
      });
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (note?._id) {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveTimeout.current = setTimeout(() => {
        saveNote();
      }, 5000);
    }
  }, [JSON.stringify(note)]);

  useEffect(() => {
    if (note?._id && retry !== 0) {
      saveNote();
    }
  }, [retry]);

  if (fetchingNote) {
    return (
      <div className="w-full flex flex-col items-center pt-[10%]">
        <BeatLoader
          color={"#7d54d5"}
          loading={fetchingNote}
          size={40}
          aria-label="Loading Spinner"
          data-testid="loader"
        />

        <p className="text-gray-600">Loading Note Data...</p>
      </div>
    );
  }

  if (!note || !note?._id) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-[10%] flex flex-col items-center">
        <ErrorIcon />
        <p className="text-lg text-gray-600">
          {error || "Failed to Fetch Note"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-4 md:px-0 px-4">
      <NoteHeader
        note={note}
        lastUpdateTime={lastUpdateTime}
        saveError={saveError}
        savingData={saving}
        setNote={setnote}
        setRetry={setretry}
      />

      <div className="w-full md:space-x-4 md:flex md:space-y-0 space-y-4">
        <Tiptap noteId={note._id} setNote={setnote} note={note} />

        {note.fileUrl && (
          <div className="md:w-[40%] md:maw-w-[700px]">
            <h4 className="md:hidden text-sm mb-2">Source</h4>
            <iframe
              src={`${note.fileUrl}${"#toolbar=0&theme=light"}`}
              height={"70vh"}
              width={"100%"}
              className="w-full h-[70vh]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Note;
