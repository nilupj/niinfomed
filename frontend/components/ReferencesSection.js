import React, { useMemo, useState } from "react";
import Link from "next/link";

/**
 * ReferencesSection
 * Supports:
 * 1) referencesHtml (string) -> Wagtail RichText HTML
 * 2) references (array) -> [{title, url}]
 */
export default function ReferencesSection({
  referencesHtml = "",
  references = null,
  title = "References",
  showTitle = false,
}) {
  const [expanded, setExpanded] = useState(false);

  // ✅ Convert HTML references into array (safe fallback)
  const parsedFromHtml = useMemo(() => {
    if (!referencesHtml || typeof referencesHtml !== "string") return [];

    // Try to extract <a href="...">Title</a>
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
    const results = [];

    let match;
    while ((match = linkRegex.exec(referencesHtml)) !== null) {
      const url = match[1];
      const text = match[2]
        ?.replace(/<[^>]*>/g, "")
        ?.replace(/&nbsp;/g, " ")
        ?.trim();

      if (text) {
        results.push({
          title: text,
          url: url,
        });
      }
    }

    return results;
  }, [referencesHtml]);

  // ✅ Decide final references list
  const displayReferences = useMemo(() => {
    // If references is already array -> use it
    if (Array.isArray(references)) return references;

    // Else parse from html
    if (Array.isArray(parsedFromHtml) && parsedFromHtml.length > 0)
      return parsedFromHtml;

    return [];
  }, [references, parsedFromHtml]);

  // ✅ If nothing exists -> don't show anything
  if (!referencesHtml && (!displayReferences || displayReferences.length === 0)) {
    return null;
  }

  const limit = 6;
  const shown = expanded ? displayReferences : displayReferences.slice(0, limit);

  return (
    <div className="mt-6">
      {showTitle && (
        <h3 className="text-xl font-bold mb-3 text-neutral-900">{title}</h3>
      )}

      {/* ✅ If references are array */}
      {displayReferences.length > 0 ? (
        <>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700">
            {shown.map((ref, index) => {
              const refTitle =
                ref?.title || ref?.name || ref?.text || `Reference ${index + 1}`;
              const refUrl = ref?.url || ref?.link || null;

              return (
                <li key={ref?.id || index}>
                  {refUrl ? (
                    <a
                      href={refUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline break-words"
                    >
                      {refTitle}
                    </a>
                  ) : (
                    <span className="break-words">{refTitle}</span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Show more/less */}
          {displayReferences.length > limit && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="mt-3 text-sm font-semibold text-green-700 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      ) : (
        // ✅ If referencesHtml exists but parsing failed -> render raw HTML safely
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: referencesHtml }}
        />
      )}
    </div>
  );
}
