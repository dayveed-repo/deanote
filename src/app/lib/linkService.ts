import puppeteer from "puppeteer";

export async function extractTextWithPuppeteer(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

  const text = await page.evaluate(() => {
    // Extract Title
    const title =
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content") ||
      document.querySelector("title")?.innerText ||
      document.querySelector("h1")?.innerText ||
      "";

    // Extract Date (heuristic)
    const possibleDateSelectors = [
      "time",
      ".date",
      ".pub-date",
      ".published",
      "[datetime]",
    ];
    let date = "";

    for (const selector of possibleDateSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        date = el.getAttribute("datetime") || el?.textContent || "";
        break;
      }
    }

    // Clean and extract main paragraphs
    let headings = ["h2", "h3", "h4", "h5"];

    const paragraphs = Array.from(
      document.querySelectorAll(
        "article p, main p, .content p, .post-content p, h2, h3, h4, cite, li"
      )
    ).map((p) => {
      const tag = p.tagName.toLowerCase();
      const content = p.textContent?.trim() || "";
      let divider = Array((content.length || 0) + 5).fill("=");

      if (headings.includes(tag) && content) {
        return `${divider.join("")}\n${content}\n${divider.join("")}`;
      } else {
        return content;
      }
    }); // avoid short captions

    // return {
    //   title: title.trim(),
    //   date: date?.trim(),
    //   content: paragraphs.join("\n\n"),
    // };

    return `${title}\n\n Update Time: ${date}\n\n ${paragraphs.join("\n\n")}`;
  });
  await browser.close();
  return text;
}
