import axios from "axios";

const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL || "http://127.0.0.1:8001";

// Cache → performance boost
const pageCache = new Map();

/**
 * Resolve ANY wagtail page → frontend URL
 */
async function resolveWagtailPageUrl(id) {
  if (!id) return "#";
  if (pageCache.has(id)) return pageCache.get(id);

  try {
    const res = await axios.get(`${CMS_API_URL}/api/v2/pages/${id}/`);
    const data = res.data;

    /**
     * Example url_path from wagtail:
     * /home/news/my-article/
     * /home/yoga-exercise/pose-1/
     */

    const urlPath = data?.meta?.url_path;

    if (!urlPath) return "#";

    // 🔥 Convert wagtail path → frontend path
    let frontendUrl = urlPath
      .replace(/^\/home/, "") // remove /home
      .replace(/\/$/, ""); // remove trailing slash

    if (!frontendUrl) frontendUrl = "/";

    pageCache.set(id, frontendUrl);

    console.log("✅ Internal link resolved:", {
      id,
      wagtail: urlPath,
      frontend: frontendUrl,
    });

    return frontendUrl;
  } catch (error) {
    console.error("❌ Wagtail link resolve failed:", id, error);
    return "#";
  }
}

/**
 * Fix ALL internal links inside wagtail richtext
 */
export async function fixWagtailInternalLinksAsync(html = "") {
  if (!html || typeof html !== "string") return "";

  let output = html;

  /* ============================
     1️⃣ PAGE LINKS
     ============================ */
  const pageLinks = [
    ...output.matchAll(
      /<a([^>]+?)linktype="page"([^>]+?)id="(\d+)"([^>]*)>/gi
    ),
  ];

  for (const match of pageLinks) {
    const [fullTag, before, middle, id, after] = match;
    const url = await resolveWagtailPageUrl(id);

    const cleanTag = `<a${before}${middle}href="${url}"${after}>`;
    output = output.replace(fullTag, cleanTag);
  }

  /* ============================
     2️⃣ DOCUMENT LINKS
     ============================ */
  output = output.replace(
    /<a([^>]+?)linktype="document"([^>]+?)id="(\d+)"([^>]*)>/gi,
    `<a$1$2href="${CMS_API_URL}/documents/$3/" target="_blank" rel="noopener noreferrer"$4>`
  );

  /* ============================
     3️⃣ CLEANUP
     ============================ */
  output = output
    .replace(/\s?linktype="[^"]*"/gi, "")
    .replace(/\s?id="\d+"/gi, "");

  return output;
}
