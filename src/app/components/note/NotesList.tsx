import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import Note from "./Note";

const NotesList = ({
  refreshList,
  currentTab,
  setRefreshList,
}: {
  refreshList: number;
  currentTab: string;
  setRefreshList: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const currentUser = useUser();
  const [notes, setNotes] = useState<{ [key: string]: any }[] | null>(null);
  const [fetchingNotes, setfetchingNotes] = useState(false);

  const fetchNotes = async () => {
    // Fetch notes logic here
    if (!currentUser.user?.id) {
      return;
    }

    setfetchingNotes(true);
    try {
      const response = await fetch(
        `/api/getNotes?clerkId=${currentUser.user?.id}${
          currentTab && currentTab !== "all" ? `&type=${currentTab}` : ""
        }`
      );
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes || []);
        setfetchingNotes(false);
      } else {
        setfetchingNotes(false);
        setNotes([]);
        console.error("Error fetching notes:", data.error);
      }
    } catch (error) {
      setfetchingNotes(false);
      setNotes([]);
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [refreshList, currentUser.user?.id, currentTab]);

  if (fetchingNotes) {
    return (
      <div className="w-full flex flex-col items-center pt-[15%]">
        <BeatLoader
          color={"#7d54d5"}
          loading={fetchingNotes}
          size={40}
          aria-label="Loading Spinner"
          data-testid="loader"
        />

        <p className="text-gray-600">Loading Notes...</p>
      </div>
    );
  }

  if (notes !== null && notes.length === 0) {
    return (
      <div className="w-full flex flex-col items-center pt-[15%]">
        <p className="text-gray-600">Notes not found</p>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-100 bg-white rounded-2xl divide-y divide-gray-200 p-4">
      {notes?.map((note: any) => (
        <Note
          key={note._id}
          _id={note._id}
          title={note.title}
          setRefreshList={setRefreshList}
          lastUpdate={note.updatedAt}
          type={note.type}
        />
      ))}
    </div>
  );
};

export default NotesList;
