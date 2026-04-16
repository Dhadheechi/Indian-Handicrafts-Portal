"use client";
import { useState, useEffect } from "react";
import { languageLabels } from "@/data/crafts";
import { Craft } from "@/lib/types";
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

  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crafts')
      .then(res => res.json())
      .then(data => {
        setCrafts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch crafts:", err);
        setLoading(false);
      });
  }, []);

  const selectedCraft = crafts.length > 0
    ? crafts.find((c) => c.id === selectedCraftId) || crafts[0]
    : null;

  const navigate = (next: string) => setPage(next);
  const openCraft = (id: number) => {
    setSelectedCraftId(id);
    setPage("detail");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav language={language} setLanguage={setLanguage} navigate={navigate} />

      <Hero language={language} query={query} setQuery={setQuery} navigate={navigate} />

      {loading ? (
        <div className="flex items-center justify-center p-20 text-xl text-slate-500">
          Loading amazing crafts...
        </div>
      ) : (
        <>
          {page === "home" && (
            <>
              <StateMap navigate={navigate} setSelectedState={setSelectedState} />
              <CraftListing
                crafts={crafts}
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
              crafts={crafts}
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

          {page === "detail" && selectedCraft && <CraftDetail craft={selectedCraft} />}

          {page === "chatbot" && <Chatbot language={language} selectedState={selectedState} />}
        </>
      )}

      <Footer />
    </div>
  );
}