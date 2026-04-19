"use client";

import { useEffect, useState } from "react";
import { languageLabels } from "@/data/crafts";
import { Craft } from "@/lib/types";
import TopNav from "@/components/ui/top-nav";
import Hero from "@/components/ui/hero";
import Footer from "@/components/ui/footer";

type SearchResultCraft = Craft & {
  similarity?: number;
};

export default function HomePage() {
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultCraft[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = (await response.json()) as SearchResultCraft[];
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Search failed:", error);
        setSearchResults([]);
        setSearchError("Unable to fetch search results right now. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col text-[var(--foreground)]" style={{ padding: "0 20px" }}>
      <div style={{ marginTop: "20px" }}>
        <TopNav language={language} setLanguage={setLanguage as any} />
      </div>
      <main className="flex-1 flex flex-col justify-center">
        <Hero
          language={language}
          query={query}
          setQuery={setQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          searchError={searchError}
        />
      </main>
      <Footer />
    </div>
  );
}
