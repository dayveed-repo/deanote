import { link } from "fs";
import { useState } from "react";
import { MdClose, MdCloudUpload } from "react-icons/md";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { convertFileTypes, fileToBase64 } from "../helper";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  setRefreshList: React.Dispatch<React.SetStateAction<number>>;
}

const notesDesc = {
  text: "Text type notes are simple notes for reguar note taking",
  link: "Link type notes are notes which allow you take note and gain insights based in provided link.",
  doc: "Document type notes are notes which allow you take note and gain insights based in uploaded file (PDF, DOC, TXT)",
};

const Modal: React.FC<ModalProps> = ({ open, onClose, setRefreshList }) => {
  const [form, setForm] = useState({ filename: "", type: "text", linkUrl: "" });
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<any>("");
  const currentUser = useUser();
  const [isLoading, setisLoading] = useState(false);
  const [note, setnote] = useState(notesDesc.text);
  const [progressTrack, setprogressTrack] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const bas64 = await fileToBase64(selectedFile);
      setBase64(bas64);
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle note creation logic here

    try {
      const payload = {
        title: form.filename,
        type: form.type,
        link: form.type === "link" ? form.linkUrl : "",
        fileBase64: form.type === "document" ? base64 : "",
        clerkUserId: currentUser.user?.id || "",
      };

      setisLoading(true);

      setprogressTrack(
        form.type === "link"
          ? "Extracting Link Information and Data (1/2)"
          : form.type === "document"
          ? "Extracting Document Information and Data (1/2)"
          : ""
      );

      const newNoteRes = await fetch("/api/note/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const newNoteJson = await newNoteRes.json();

      if (!newNoteJson?.success || !newNoteJson?.note) {
        console.log("Error creating note:", newNoteJson.error);
        setisLoading(false);
        toast.error(`Failed to create note. ${newNoteJson.error || ""}`);
      }

      if (form.type !== "link" && form.type !== "document") {
        setForm({ filename: "", type: "text", linkUrl: "" });
        setFile(null);
        setBase64(null);
        toast.success("Note created successfully!");
        setisLoading(false);
        setRefreshList(Math.random());
        onClose();
        return;
      }

      setprogressTrack(
        form.type === "link"
          ? "Processing Extracted Link Information (2/2)"
          : form.type === "document"
          ? "Processing Extracted Document Information (2/2)"
          : ""
      );

      const savedEmbeddingsRes = await fetch("/api/transform-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: newNoteJson.note.fileUrl,
          type: newNoteJson.note.type,
          fileType: convertFileTypes(newNoteJson.note.fileType || ""),
          noteId: newNoteJson.note._id,
          userId: newNoteJson.note.user,
          clerkUserId: currentUser.user?.id,
        }),
      });

      const embeddingJson = await savedEmbeddingsRes.json();

      setprogressTrack("");
      if (embeddingJson.success) {
        setForm({ filename: "", type: "text", linkUrl: "" });
        setFile(null);
        setBase64(null);
        toast.success("Note created successfully!");
        setisLoading(false);
        setRefreshList(Math.random());
        onClose();
      } else {
        console.log("Error creating note:", embeddingJson?.error);
        setisLoading(false);
        toast.error(`Failed to create note. ${embeddingJson?.error || ""}`);
      }
    } catch (error) {
      setprogressTrack("");
      setisLoading(false);
      toast.error("Failed to create note. Please try again.");
      console.error("Error creating note:", error);
    }
  };

  return (
    open && (
      <div className="modal" onClick={onClose}>
        <div className="modal-body" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create New Note</h2>

            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <MdClose />
            </button>
          </div>

          <form onSubmit={createNote}>
            <div className="mb-4">
              <label className="form-label">
                Title
                <input
                  type="text"
                  name="filename"
                  value={form.filename}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, filename: e.target.value }))
                  }
                  className="form-input mt-1"
                />
              </label>
            </div>

            <div className="mb-2">
              <label className="form-label">
                Type
                <select
                  name="type"
                  value={form.type}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      type: e.target.value,
                      linkUrl: "",
                    }));
                    setBase64("");
                    setFile(null);
                    setnote(
                      e.target.value === "document"
                        ? notesDesc.doc
                        : e.target.value === "link"
                        ? notesDesc.link
                        : notesDesc.text
                    );
                  }}
                  className="mt-1 form-input"
                >
                  <option value="text">Text</option>
                  <option value="document">Document Based</option>
                  <option value="link">Link Based</option>
                </select>
              </label>
            </div>

            <p className="text-xs text-gray-500 mb-4">{note}</p>

            {form.type === "document" && (
              <div>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed rounded-2xl cursor-pointer bg-[#f5effc] border-[var(--primary)] hover:bg-[#e9dafd] transition"
                >
                  <span className="mb-2 text-3xl text-[#7d54d5]">
                    <MdCloudUpload />
                  </span>
                  <span className="text-sm">Click to upload</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {file && (
                  <div className="mt-4">
                    <p className="text-sm">
                      <span className="text-[var(--foreground-secondary)]">
                        Selected file:
                      </span>{" "}
                      {file.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {form.type === "link" && (
              <div>
                <label className="form-label">
                  Link URL:
                  <input
                    type="text"
                    name="linkUrl"
                    value={form.linkUrl}
                    placeholder="https://example.com"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, linkUrl: e.target.value }))
                    }
                    className="form-input mt-1"
                  />
                </label>
              </div>
            )}

            <div className="w-full flex items-center justify-end mt-6 space-x-2">
              {progressTrack && (
                <p className="text-[var(--foreground-secondary)] text-sm font-medium">
                  {progressTrack}
                </p>
              )}
              <button
                className="button-secondary"
                onClick={() => {
                  setForm({ filename: "", type: "text", linkUrl: "" });
                  setFile(null);
                  setBase64(null);
                  setisLoading(false);
                  onClose();
                }}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default Modal;
