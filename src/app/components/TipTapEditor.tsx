"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";

import {
  BulletList,
  ListItem,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Strike from "@tiptap/extension-strike";
import TextAlign from "@tiptap/extension-text-align";
import Bold from "@tiptap/extension-bold";
import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Italic from "@tiptap/extension-italic";
import { Placeholder, UndoRedo } from "@tiptap/extensions";

import {
  LuHeading3,
  LuHeading2,
  LuHeading1,
  LuBold,
  LuItalic,
  LuUnderline,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuList,
  LuListChecks,
  LuCode,
  LuHighlighter,
  LuStrikethrough,
} from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import promptAI from "../config/aiModel";

const Tiptap = ({
  noteId,
  setNote,
  note,
}: {
  noteId: string;
  note: {
    [key: string]: any;
  } | null;
  setNote: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    } | null>
  >;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Placeholder.configure({
        placeholder: "Write something …",
      }),
      // UndoRedo,
      BulletList,
      ListItem,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Color,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Bold,
      Code,
      Highlight.configure({ multicolor: true }),
      Underline,
      Link,
      Italic,
      Strike,
    ],
    content: note?.content || "",
    onUpdate: (editor) => {
      setNote({ ...note, content: editor.editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    autofocus: true,
  });

  const [, setTick] = useState(0);
  const [processing, setprocessing] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      setTick(Math.random());
    };

    // listen to selection changes or transactions
    editor.on("transaction", update); // fires for any change
    editor.on("selectionUpdate", update); // fires when cursor/selection changes

    return () => {
      editor.off("transaction", update);
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

  if (!editor) {
    return <></>;
  }

  const AIQuery = async () => {
    if (!editor) return;

    try {
      const highlightedQuestion = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      );

      if (!highlightedQuestion) {
        toast.error("Ask a question to obtain an AI based response");
      }

      setprocessing(true);

      const queryRes = await fetch("/api/queryNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: highlightedQuestion, noteId }),
      });
      const queryJson = await queryRes.json();

      if (!queryJson?.success || !queryJson?.answers) {
        // editor.chain().focus().insertContent(data.response).run();
        //  console.log(data);
        setprocessing(false);
        return toast.error("No response from AI.");
      }

      const prompt = `For question: ${highlightedQuestion} and with given content of ${queryJson.answers}, give me proper consise answer in HTML format. This answer should be strictly in relation to the given context and answer should not state that you are referencing a context`;

      const aiResponse = await promptAI(prompt);
      let fullResponse = "";

      for await (const chunk of aiResponse) {
        if (chunk.text) {
          fullResponse += chunk.text;
        }
      }

      const allcontent = editor.getHTML();
      editor.commands.setContent(
        allcontent +
          "" +
          fullResponse
            ?.replaceAll("`", "")
            .replaceAll("html", "")
            .replaceAll("<>", "")
      );

      setprocessing(false);
    } catch (error) {
      toast.error("Failed to fetch AI response.");
      setprocessing(false);
      console.log(error);
    }
  };

  return (
    <div
      className={`md:min-w-[60%] ${
        note?.type === "link" || note?.type === "document"
          ? "md:max-w-[60%]"
          : ""
      } flex-grow space-y-3`}
    >
      <div className="border-b-[0.5px] border-b-gray-300 gap-x-5 gap-y-3 flex items-center py-2 flex-wrap">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`editor-icon 
              ${editor?.isActive("heading", { level: 1 }) ? "is-active" : ""}
              `}
          >
            <LuHeading1 />
          </button>
          <button
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`editor-icon
              ${editor?.isActive("heading", { level: 2 }) ? "is-active" : ""}
              `}
          >
            <LuHeading2 />
          </button>
          <button
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`editor-icon
              ${editor?.isActive("heading", { level: 3 }) ? "is-active" : ""}
              `}
          >
            <LuHeading3 />
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`editor-icon ${
              editor?.isActive("bold") ? "is-active" : ""
            }`}
          >
            <LuBold />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`editor-icon ${
              editor?.isActive("italic") ? "is-active" : ""
            }`}
          >
            <LuItalic />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`editor-icon ${
              editor?.isActive("underline") ? "is-active" : ""
            }`}
          >
            <LuUnderline />
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() =>
              editor?.chain().focus().toggleTextAlign("left").run()
            }
            className={`
              editor-icon
              ${editor?.isActive({ textAlign: "left" }) ? "is-active" : ""}
              `}
          >
            <LuAlignLeft />
          </button>
          <button
            onClick={() =>
              editor?.chain().focus().toggleTextAlign("center").run()
            }
            className={`
                editor-icon
                ${editor?.isActive({ textAlign: "center" }) ? "is-active" : ""}
              `}
          >
            <LuAlignCenter />
          </button>
          <button
            onClick={() =>
              editor?.chain().focus().toggleTextAlign("right").run()
            }
            className={`
              editor-icon
              ${editor?.isActive({ textAlign: "right" }) ? "is-active" : ""}
              `}
          >
            <LuAlignRight />
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`editor-icon ${
              editor?.isActive("bulletList") ? "is-active" : ""
            }`}
          >
            <LuList />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            className={`editor-icon ${
              editor?.isActive("taskList") ? "is-active" : ""
            }`}
          >
            <LuListChecks />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={`editor-icon ${
              editor?.isActive("code") ? "is-active" : ""
            }`}
          >
            <LuCode />
          </button>

          <button
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleHighlight({ color: "#7d54d5" })
                .run()
            }
            className={`
             editor-icon ${
               editor?.isActive("highlight", { color: "#7d54d5" })
                 ? "is-active"
                 : ""
             }`}
          >
            <LuHighlighter />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`editor-icon ${
              editor?.isActive("strike") ? "is-active" : ""
            }`}
          >
            <LuStrikethrough />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={AIQuery}
            className="editor-icon hover:text-amber-300 transition-all hover:scale-125"
          >
            <BsStars />
          </button>

          {processing && (
            <p className="text-gray-600 font-medium transition-all">
              Thinking...
            </p>
          )}
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="bg-white shadow-sm min-h-[60vh] p-2"
      />
    </div>
  );
};

export default Tiptap;
