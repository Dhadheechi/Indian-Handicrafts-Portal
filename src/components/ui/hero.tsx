"use client";
import { languageLabels } from "@/data/crafts";

export default function Hero({
  language,
  query,
  setQuery,
  navigate,
}: {
  language: keyof typeof languageLabels;
  query: string;
  setQuery: (value: string) => void;
  navigate: (page: string) => void;
}) {
  const t = languageLabels[language];

  return (
    <section style={{ border: "2px solid grey", margin: "20px 0", padding: "20px" }}>
      <div style={{ marginBottom: "15px" }}>
        <span style={{ border: "1px solid black", padding: "2px 8px", fontSize: "0.8rem" }}>
          Cultural Discovery Tool
        </span>
      </div>

      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0 0 10px 0" }}>
        {t.heroTitle}
      </h1>
      <p style={{ color: "#555", marginBottom: "20px" }}>
        {t.heroSubtitle}
      </p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          style={{ padding: "10px", width: "300px", marginRight: "10px", border: "1px solid black" }}
        />
        <button 
          onClick={() => navigate("crafts")}
          style={{ padding: "10px 20px", border: "1px solid black", cursor: "pointer" }}
        >
          {t.browseCrafts}
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={() => navigate("map")}
          style={{ padding: "8px 15px", border: "1px solid grey", cursor: "pointer" }}
        >
          [Go to Map] {t.exploreMap}
        </button>
        <button 
          onClick={() => navigate("chatbot")}
          style={{ padding: "8px 15px", border: "1px solid grey", cursor: "pointer" }}
        >
          [Talk to Bot] {t.chatbotTitle}
        </button>
      </div>
    </section>
  );
}