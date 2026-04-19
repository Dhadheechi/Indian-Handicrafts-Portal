"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { languageLabels } from "@/data/crafts";
import { Craft } from "@/lib/types";
import TopNav from "@/components/ui/top-nav";
import CraftListing from "@/components/ui/craft-listing";
import Footer from "@/components/ui/footer";

type DynamicFiltersPayload = {
  states: string[];
  filters: {
    category: string[];
    material: string[];
    technique: string[];
  };
  maps: {
    category: Record<string, string>;
    material: Record<string, string>;
    technique: Record<string, string>;
  };
};

const FALLBACK_FILTERS: DynamicFiltersPayload = {
  states: ["All"],
  filters: {
    category: ["All"],
    material: ["All"],
    technique: ["All"],
  },
  maps: {
    category: {},
    material: {},
    technique: {},
  },
};

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
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFiltersPayload>(FALLBACK_FILTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/crafts"), fetch("/api/filters")])
      .then(async ([craftRes, filterRes]) => {
        if (!craftRes.ok) {
          throw new Error("Failed to fetch crafts");
        }

        const craftData = (await craftRes.json()) as Craft[];
        setCrafts(craftData);

        if (filterRes.ok) {
          const filterData = (await filterRes.json()) as DynamicFiltersPayload;
          setDynamicFilters(filterData);
        } else {
          const uniqueStates = ["All", ...Array.from(new Set(craftData.map((craft) => craft.state))).sort()];
          setDynamicFilters((prev) => ({ ...prev, states: uniqueStates }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch crafts/filters:", err);
      })
      .finally(() => {
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
        states={dynamicFilters.states}
        filters={dynamicFilters.filters}
        maps={dynamicFilters.maps}
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
