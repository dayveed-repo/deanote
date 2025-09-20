import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deanote",
  description:
    "Upload documents or share links to instantly ask questions, take notes, and extract insights. Transform PDFs, articles, and reports into clear, actionable knowledge within seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={nunito.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
