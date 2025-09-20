"use client";
import { useUser } from "@clerk/nextjs";
import { get } from "http";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { getIcon } from "../helper";
import { set } from "mongoose";

const SearchBar = () => {
  const [notes, setNotes] = useState<any[] | null>(null);
  const [fetchingNotes, setfetchingNotes] = useState(false);
  const currentUser = useUser();
  const router = useRouter();
  const [showOptions, setshowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSearchedNotes = async (value: string) => {
    // Fetch notes logic here
    if (!currentUser.user?.id) {
      return;
    }
    setshowOptions(value ? true : false);
    setfetchingNotes(true);
    try {
      const response = await fetch(
        `/api/getNotes?clerkId=${currentUser.user?.id}${
          value ? `&title=${value}` : ""
        }`
      );
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes || []);
        setfetchingNotes(false);
      } else {
        setfetchingNotes(false);
        setNotes([]);
        console.error("Error searching notes:", data.error);
      }
    } catch (error) {
      setfetchingNotes(false);
      setNotes([]);
      console.error("Error searching notes:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setshowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative flex px-4 py-2 text-sm border-2 border-[var(--secondary)] focus-within:border-[var(--primary)] rounded-full"
    >
      <input
        type="text"
        placeholder="Search..."
        className="bg-transparent outline-none flex-grow"
        onChange={(e) => fetchSearchedNotes(e.target.value)}
      />
      <span className="flex items-center text-[var(--primary)]">
        <FiSearch className="w-5 h-5" />
      </span>

      {showOptions && (
        <div className="absolute top-[110%] left-0 max-h-[300px] divide-y divide-gray-200 shadow-md bg-white w-full">
          {fetchingNotes ? (
            <div className="w-full flex flex-col items-center p-4">
              <p className="text-[var(--foreground-secondary)] text-xs">
                Loading...
              </p>
            </div>
          ) : Array.isArray(notes) && notes?.length ? (
            notes?.map((note) => (
              <div
                key={note._id}
                className="py-1.5 px-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-1"
                onClick={() => router.push(`/dashboard/note/${note._id}`)}
              >
                <Image
                  src={getIcon(note.type)}
                  alt={note.type}
                  height={0}
                  width={0}
                  unoptimized
                  className="h-4 w-auto"
                />
                <h3 className="font-medium">{note.title}</h3>
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center p-4">
              <p className="text-[var(--foreground-secondary)] text-xs">
                No results found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
