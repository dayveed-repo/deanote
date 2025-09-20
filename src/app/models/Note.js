import { noteTypes } from "../types";
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: noteTypes,
      default: "text",
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
      required: function () {
        return this.type === "link" || this.type === "document"; // ✅ Works here
      },
    },
    fileRef: {
      type: String,
      default: "",
      required: function () {
        return this.type === "link" || this.type === "document"; // ✅ Works here
      },
    },
    fileType: {
      type: String,
      default: "",
      required: function () {
        return this.type === "link" || this.type === "document"; // ✅ Works here
      },
    },
    fileSizeInBytes: {
      type: Number,
      default: 0,
      required: function () {
        return this.type === "link" || this.type === "document"; // ✅ Works here
      },
    },
    linkUrl: {
      type: String,
      default: "",
      required: function () {
        return this.type === "link"; // ✅ Works here
      },
    },
    clerkUserId: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deanoteUsers", // <-- this references the User model
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Note =
  mongoose.models.deanoteNotes || mongoose.model("deanoteNotes", NoteSchema);
export default Note;
