"use client";
import Image from "next/image";
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import moment from "moment";
import { useRouter } from "next/navigation";
import { getIcon } from "@/app/helper";
import DeleteModal from "./DeleteModal";

const Note = ({
  title,
  type,
  lastUpdate,
  _id,
  setRefreshList,
}: {
  title: string;
  type: string;
  lastUpdate: string;
  setRefreshList: React.Dispatch<React.SetStateAction<number>>;
  _id: string;
}) => {
  const router = useRouter();
  const iconSrc = getIcon(type);

  const [isDeleteOpen, setisDeleteOpen] = useState(false);

  return (
    <div
      onClick={() => router.push(`/dashboard/note/${_id}`)}
      className="md:flex items-center p-2 md:p-4 space-y-1.5 bg-white hover:bg-[var(--secondary)] transition-bg duration-300 cursor-pointer"
    >
      <div className="space-y-1 w-full md:w-[65%]">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>

      <div className="flex items-center space-x-1 md:w-[15%]">
        <Image
          src={iconSrc}
          alt={type}
          height={0}
          width={0}
          unoptimized
          className="h-4 md:h-5 w-auto"
        />
        {type ? (
          <p className="text-xs md:text-sm text-[var(--foreground-secondary)] capitalize">
            {type} Based
          </p>
        ) : (
          ""
        )}
      </div>

      <div className="flex items-center space-x-3 justify-between md:w-[20%]">
        <p className="text-xs md:text-sm text-gray-700">
          Last Updated:{" "}
          <span className="text-[var(--foreground-secondary)]">
            {moment(lastUpdate).format("DD/MM/YYYY")}
          </span>
        </p>

        <MdDelete
          className="text-base text-gray-600 cursor-pointer hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            setisDeleteOpen(true);
          }}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteOpen}
        noteId={_id}
        noteTitle={title}
        onClose={() => setisDeleteOpen(false)}
        onSuccess={() => {
          setRefreshList(Math.random());
        }}
      />
    </div>
  );
};

export default Note;
