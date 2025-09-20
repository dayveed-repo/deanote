import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  const { html } = await req.json();

  if (!html)
    return NextResponse.json(
      { error: "Missing required data" },
      { status: 422 }
    );

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    await browser.close();

    if (!pdfBuffer || (pdfBuffer as any).length === 0) {
      return NextResponse.json({ error: "Empty PDF buffer" }, { status: 422 });
    }

    // Ensure we have a Node Buffer (pdfBuffer may be Uint8Array)
    const buffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    const base64PDF = buffer.toString("base64");

    return NextResponse.json(
      {
        base64: `data:application/pdf;base64,${base64PDF}`,
        mimeType: "application/pdf",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Error occured while generating PDF" },
      { status: 500 }
    );
  }
}
