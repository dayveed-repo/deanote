"use client";
import React, { useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import Modal from "../components/Modal";
import { Toaster } from "react-hot-toast";
import NotesList from "../components/note/NotesList";

const tabs = [
  {
    title: "All Notes",
    type: "all",
  },
  {
    title: "Text Based Notes",
    type: "text",
  },
  {
    title: "Documents Based Notes",
    type: "document",
  },
  {
    title: "Link Based Notes",
    type: "link",
  },
];

const Dashboard = () => {
  const [currentTab, setcurrentTab] = useState("all");
  const [openForm, setopenForm] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
      {/* Add more dashboard components here */}
      <Toaster />
      <div className="md:hidden flex items-center space-x-2 overflow-x-scroll mt-4">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setcurrentTab(tab.type)}
            className={`px-4 py-2 text-sm font-medium min-w-max transition-colors cursor-pointer ${
              currentTab === tab.type
                ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                : "text-[var(--foreground-secondary)] hover:bg-gray-200"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 md:mt-8">
        <h1 className="text-lg md:text-2xl font-bold">Notes</h1>

        <div className="hidden md:flex items-center space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setcurrentTab(tab.type)}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                currentTab === tab.type
                  ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                  : "text-[var(--foreground-secondary)] hover:bg-gray-200"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        <button
          className="button flex items-center space-x-2 cursor-pointer"
          onClick={() => setopenForm(true)}
        >
          <MdAddCircleOutline className="w-4 h-4" /> <span>Create Note</span>
        </button>
      </div>

      <div className="mt-4 w-full">
        <NotesList
          setRefreshList={setRefreshList}
          refreshList={refreshList}
          currentTab={currentTab}
        />
      </div>

      <Modal
        open={openForm}
        onClose={() => setopenForm(false)}
        setRefreshList={setRefreshList}
      />
    </div>
  );
};

export default Dashboard;
