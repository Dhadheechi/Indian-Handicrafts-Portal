"use client";
import { useState } from "react";
import { crafts, languageLabels } from "@/data/crafts";
import TopNav from "@/components/ui/top-nav";
import Hero from "@/components/ui/hero";
import StateMap from "@/components/ui/state-map";
import CraftListing from "@/components/ui/craft-listing";
import CraftDetail from "@/components/ui/craft-detail";
import Chatbot from "@/components/ui/chatbot";
import Footer from "@/components/ui/footer";

export default function HomePage() {
  const [page, setPage] = useState("home");
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedTechnique, setSelectedTechnique] = useState("All");
  const [selectedCraftId, setSelectedCraftId] = useState(1);

  const selectedCraft = crafts.find((c) => c.id === selectedCraftId) || crafts[0];

  const navigate = (next: string) => setPage(next);
  const openCraft = (id: number) => {
    setSelectedCraftId(id);
    setPage("detail");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav language={language} setLanguage={setLanguage} navigate={navigate} />

      <Hero language={language} query={query} setQuery={setQuery} navigate={navigate} />

      {page === "home" && (
        <>
          <StateMap navigate={navigate} setSelectedState={setSelectedState} />
          <CraftListing
            query={query}
            selectedState={selectedState}
            selectedCategory={selectedCategory}
            selectedMaterial={selectedMaterial}
            selectedTechnique={selectedTechnique}
            setSelectedState={setSelectedState}
            setSelectedCategory={setSelectedCategory}
            setSelectedMaterial={setSelectedMaterial}
            setSelectedTechnique={setSelectedTechnique}
            openCraft={openCraft}
          />
          <Chatbot language={language} selectedState={selectedState} />
        </>
      )}

      {page === "map" && <StateMap navigate={navigate} setSelectedState={setSelectedState} />}

      {page === "crafts" && (
        <CraftListing
          query={query}
          selectedState={selectedState}
          selectedCategory={selectedCategory}
          selectedMaterial={selectedMaterial}
          selectedTechnique={selectedTechnique}
          setSelectedState={setSelectedState}
          setSelectedCategory={setSelectedCategory}
          setSelectedMaterial={setSelectedMaterial}
          setSelectedTechnique={setSelectedTechnique}
          openCraft={openCraft}
        />
      )}

      {page === "detail" && <CraftDetail craft={selectedCraft} />}

      {page === "chatbot" && <Chatbot language={language} selectedState={selectedState} />}

      <Footer />
    </div>
  );
}