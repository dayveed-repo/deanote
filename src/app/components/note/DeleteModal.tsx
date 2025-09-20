import React, { useState } from "react";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  noteTitle: string;
  noteId: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  noteTitle,
  noteId,
}) => {
  const [isLoading, setisLoading] = useState(false);

  const deleteNote = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle note creation logic here

    try {
      setisLoading(true);

      const newNoteRes = await fetch(`/api/note/delete?noteId=${noteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const deletedNote = await newNoteRes.json();

      if (deletedNote.success) {
        toast.success("Note deleted successfully!");
        setisLoading(false);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        console.log("Error deleting note:", deletedNote?.error);
        setisLoading(false);
        toast.error(`Failed to delete note. ${deletedNote?.error || ""}`);
      }
    } catch (error) {
      setisLoading(false);
      toast.error("Failed to delete note. Please try again.");
      console.error("Error creating note:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Note</h2>

          <button className="modal-close" onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>

        <form onSubmit={deleteNote}>
          <p className="form-label">
            Are you sure you want to delete{" "}
            <strong>{noteTitle ? `"${noteTitle}"` : "this note"}</strong>?
          </p>

          <div className="w-full flex items-center justify-end mt-6 space-x-2">
            <button
              className="button-secondary"
              onClick={() => {
                setisLoading(false);
                onClose();
              }}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button bg-red-500"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteModal;
