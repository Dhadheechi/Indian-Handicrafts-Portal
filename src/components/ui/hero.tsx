"use client";
import { languageLabels } from "@/data/crafts";
import Link from "next/link";

export default function Hero({
  language,
  query,
  setQuery,
}: {
  language: keyof typeof languageLabels;
  query: string;
  setQuery: (value: string) => void;
}) {
  const t = languageLabels[language];

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