"use client";

import { useState } from "react";
import { languageLabels } from "@/data/crafts";
import TopNav from "@/components/ui/top-nav";
import StateMap from "@/components/ui/state-map";
import Footer from "@/components/ui/footer";

export default function MapPage() {
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      <StateMap />
      <Footer />
    </div>
  );
}
