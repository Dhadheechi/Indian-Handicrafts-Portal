"use client";

import { useMemo } from "react";
import { Craft } from "@/lib/types";
import SectionHeading from "@/components/ui/section-heading";
import CraftCard from "@/components/ui/craft-card";
import FilterSidebar from "@/components/ui/filter-sidebar";

type FilterMaps = {
  category: Record<string, string>;
  material: Record<string, string>;
  technique: Record<string, string>;
};

type FilterOptions = {
  category: string[];
  material: string[];
  technique: string[];
};

export default function CraftListing({
  crafts,
  states,
  filters,
  maps,
  query,
  selectedState,
  selectedCategory,
  selectedMaterial,
  selectedTechnique,
  setSelectedState,
  setSelectedCategory,
  setSelectedMaterial,
  setSelectedTechnique,
  openCraft,
}: {
  crafts: Craft[];
  states: string[];
  filters: FilterOptions;
  maps: FilterMaps;
  query: string;
  selectedState: string;
  selectedCategory: string;
  selectedMaterial: string;
  selectedTechnique: string;
  setSelectedState: (v: string) => void;
  setSelectedCategory: (v: string) => void;
  setSelectedMaterial: (v: string) => void;
  setSelectedTechnique: (v: string) => void;
  openCraft: (id: number) => void;
}) {
  const normalizeByMap = (type: keyof FilterMaps, value: string): string => {
    if (value === "All") return "All";
    return maps[type][value] || value;
  };

  const filtered = useMemo(() => {
    return crafts.filter((craft) => {
      const stateMatch = selectedState === "All" || craft.state === selectedState;
      const categoryMatch = selectedCategory === "All" || normalizeByMap('category', craft.category) === selectedCategory;
      const materialMatch = selectedMaterial === "All" || normalizeByMap('material', craft.material) === selectedMaterial;
      const techniqueMatch = selectedTechnique === "All" || normalizeByMap('technique', craft.technique) === selectedTechnique;
      return stateMatch && categoryMatch && materialMatch && techniqueMatch;
    });
  }, [crafts, selectedState, selectedCategory, selectedMaterial, selectedTechnique, maps]);

  return (
    <section style={{ margin: "24px 0" }}>
      <SectionHeading
        title="Find Crafts"
        subtitle="Search and filter for handicrafts using the options below."
      />
      
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <FilterSidebar
          states={states}
          filters={filters}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedTechnique={selectedTechnique}
          setSelectedTechnique={setSelectedTechnique}
        />

        <div style={{ flex: 1 }}>
          <div style={{ border: "1px solid #cfbba6", padding: "12px 14px", marginBottom: "20px", borderRadius: "12px", background: "#fffaf4", boxShadow: "0 8px 24px rgba(87, 59, 38, 0.06)" }}>
            <h3 style={{ margin: 0, color: "#2e2016" }}>Showing Results</h3>
            <p style={{ margin: "5px 0", color: "#5a493b" }}>{filtered.length} crafts found</p>
            <div style={{ fontSize: "0.8rem", fontStyle: "italic", color: "#6f5b4c" }}>
              Note: Results are filtered by state, category, material, and technique.
            </div>
          </div>

        <div style={{ 
          height: "360px", /* Height of exactly one row of cards */
          overflowY: "auto", 
          paddingBottom: "10px",
          paddingRight: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "#9e4f2f #f4e6d3"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "20px" 
          }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "15px" 
            }}>
              {filtered.map((craft) => (
                <div key={craft.id}>
                  <CraftCard
                    craft={craft}
                    categoryTag={normalizeByMap('category', craft.category)}
                    techniqueTag={normalizeByMap('technique', craft.technique)}
                    onOpen={() => openCraft(craft.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}