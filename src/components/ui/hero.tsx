"use client";
import { languageLabels } from "@/data/crafts";
import { Craft } from "@/lib/types";
import Link from "next/link";

type SearchResultCraft = Craft & {
  similarity?: number;
};

export default function Hero({
  language,
  query,
  setQuery,
  searchResults,
  isSearching,
  searchError,
}: {
  language: keyof typeof languageLabels;
  query: string;
  setQuery: (value: string) => void;
  searchResults: SearchResultCraft[];
  isSearching: boolean;
  searchError: string;
}) {
  const t = languageLabels[language];
  const hasSearchInput = query.trim().length > 0;
  const canSearch = query.trim().length >= 2;

  return (
    <section style={{ border: "1px solid #ccb8a3", borderRadius: "18px", margin: "22px 0", padding: "24px", background: "linear-gradient(140deg, #fff9f0 0%, #f8ecdc 100%)", boxShadow: "0 14px 30px rgba(92, 63, 40, 0.08)" }}>
      <div style={{ marginBottom: "15px" }}>
        <span style={{ border: "1px solid #c9b19b", borderRadius: "999px", padding: "4px 11px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#614531", background: "rgba(255, 255, 255, 0.85)", fontWeight: 700 }}>
          Cultural Discovery Tool
        </span>
      </div>

      <h1 style={{ fontSize: "2.7rem", fontWeight: 700, margin: "0 0 10px 0", color: "#2c1d12" }}>
        {t.heroTitle}
      </h1>
      <p style={{ color: "#5d4b3e", marginBottom: "22px", maxWidth: "62ch" }}>
        {t.heroSubtitle}
      </p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          style={{ padding: "11px 13px", width: "300px", marginRight: "10px", border: "1px solid #cbb39d", borderRadius: "11px", background: "#fffdf9", color: "#36261a" }}
        />
        <Link
          href="/crafts"
          style={{ display: "inline-block", padding: "11px 20px", border: "1px solid #8f4428", borderRadius: "11px", cursor: "pointer", background: "#9e4f2f", color: "#fff8f3", fontWeight: 700, textDecoration: "none" }}
        >
          {t.browseCrafts}
        </Link>
      </div>

      {hasSearchInput && (
        <div style={{ border: "1px solid #cfbaa5", borderRadius: "14px", padding: "14px", marginBottom: "20px", background: "#fffaf4" }}>
          <div style={{ fontWeight: 700, color: "#372518", marginBottom: "8px" }}>
            Search Results
          </div>

          {!canSearch && (
            <p style={{ margin: 0, color: "#6f5a4a", fontSize: "0.92rem" }}>
              Type at least 2 characters to search crafts.
            </p>
          )}

          {canSearch && isSearching && (
            <p style={{ margin: 0, color: "#6f5a4a", fontSize: "0.92rem" }}>
              Searching crafts...
            </p>
          )}

          {canSearch && !isSearching && searchError && (
            <p style={{ margin: 0, color: "#8e2f21", fontSize: "0.92rem" }}>
              {searchError}
            </p>
          )}

          {canSearch && !isSearching && !searchError && searchResults.length === 0 && (
            <p style={{ margin: 0, color: "#6f5a4a", fontSize: "0.92rem" }}>
              No crafts matched this search. Try state names, craft types, materials, or techniques.
            </p>
          )}

          {canSearch && !isSearching && !searchError && searchResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ margin: 0, color: "#5e4a3b", fontSize: "0.86rem" }}>
                Found {searchResults.length} craft matches
              </p>
              {searchResults.slice(0, 8).map((craft) => (
                <div
                  key={craft.id}
                  style={{
                    border: "1px solid #ddc9b4",
                    borderRadius: "11px",
                    background: "#fffdf8",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#2d1f14" }}>{craft.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#6b5a4b" }}>
                        {craft.state} | {craft.category} | {craft.material}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#724c34", border: "1px solid #d4bca5", borderRadius: "999px", padding: "3px 8px", background: "#faefe2", fontWeight: 700 }}>
                      {craft.gi ? "GI" : "Non-GI"}
                    </div>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <Link
                      href={`/detail?id=${craft.id}`}
                      style={{ color: "#8f4428", textDecoration: "underline", fontWeight: 600, fontSize: "0.86rem" }}
                    >
                      View craft details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <Link
          href="/map"
          style={{ display: "inline-block", padding: "9px 15px", border: "1px solid #c9b19b", borderRadius: "10px", cursor: "pointer", background: "#fffdf8", color: "#4a3525", fontWeight: 600, textDecoration: "none" }}
        >
          [Go to Map] {t.viewMap}
        </Link>
        <Link
          href="/chatbot"
          style={{ display: "inline-block", padding: "9px 15px", border: "1px solid #c9b19b", borderRadius: "10px", cursor: "pointer", background: "#fffdf8", color: "#4a3525", fontWeight: 600, textDecoration: "none" }}
        >
          [Talk to Bot] {t.chatWithAssistant}
        </Link>
      </div>
    </section>
  );
}