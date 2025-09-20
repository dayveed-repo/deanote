import {
  FaFileAlt,
  FaLink,
  FaQuestionCircle,
  FaRegStickyNote,
  FaFolderOpen,
  FaBolt,
} from "react-icons/fa";

export const features = [
  {
    title: "Smart Document Uploads",
    description:
      "Upload PDFs, Word files, or text documents and instantly interact with their content using natural language.",
    icon: <FaFileAlt />,
  },
  {
    title: "Link-Based Intelligence",
    description:
      "Drop in any article or webpage URL and ask questions as if you read it — without reading it.",
    icon: <FaLink />,
  },
  {
    title: "Ask Questions, Get Answers",
    description:
      "Just type your question. Our AI reads the content for you and responds with relevant, clear answers.",
    icon: <FaQuestionCircle />,
  },
  {
    title: "Inline Note-Taking",
    description:
      "Take notes alongside your documents or links — perfect for studying, summarizing, or planning.",
    icon: <FaRegStickyNote />,
  },
  {
    title: "Unified Workspace",
    description:
      "Keep all your uploads, links, Q&A history, and notes in one place, always accessible and searchable.",
    icon: <FaFolderOpen />,
  },
  {
    title: "AI-Powered Summarization",
    description:
      "Instantly generate summaries of long documents or pages to save time and focus on what matters.",
    icon: <FaBolt />,
  },
];
