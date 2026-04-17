"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { languageLabels } from "@/data/crafts";
import { Craft } from "@/lib/types";
import TopNav from "@/components/ui/top-nav";
import CraftListing from "@/components/ui/craft-listing";
import Footer from "@/components/ui/footer";

export default function CraftsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = searchParams.get("state") || "All";

  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedTechnique, setSelectedTechnique] = useState("All");

  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crafts")
      .then((res) => res.json())
      .then((data) => {
        setCrafts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch crafts:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const urlState = searchParams.get("state") || "All";
    setSelectedState(urlState);
  }, [searchParams]);

  const openCraft = (id: number) => {
    router.push(`/detail?id=${id}`);
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-20 text-xl text-slate-500">
          Loading amazing crafts...
        </div>
      );
    }

    return (
      <CraftListing
        crafts={crafts}
        query=""
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
    );
  }, [
    loading,
    crafts,
    selectedState,
    selectedCategory,
    selectedMaterial,
    selectedTechnique,
  ]);

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      {content}
      <Footer />
    </div>
  );
}
