"use client";

import { useState } from "react";
import { languageLabels } from "@/data/crafts";
import TopNav from "@/components/ui/top-nav";
import Chatbot from "@/components/ui/chatbot";
import Footer from "@/components/ui/footer";

export default function ChatbotPage() {
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      <Chatbot language={language} selectedState="All" />
      <Footer />
    </div>
  );
}
