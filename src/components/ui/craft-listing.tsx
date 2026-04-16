"use client";

import { useMemo } from "react";
import { Craft } from "@/lib/types";
import SectionHeading from "@/components/ui/section-heading";
import CraftCard from "@/components/ui/craft-card";
import FilterSidebar from "@/components/ui/filter-sidebar";

export default function CraftListing({
  crafts,
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
  const filtered = useMemo(() => {
    return crafts.filter((craft) => {
      const stateMatch = selectedState === "All" || craft.state === selectedState;
      const categoryMatch = selectedCategory === "All" || craft.category === selectedCategory;
      const materialMatch = selectedMaterial === "All" || craft.material === selectedMaterial;
      const techniqueMatch = selectedTechnique === "All" || craft.technique === selectedTechnique;
      return stateMatch && categoryMatch && materialMatch && techniqueMatch;
    });
  }, [crafts, selectedState, selectedCategory, selectedMaterial, selectedTechnique]);

  return (
    <section style={{ margin: "20px 0" }}>
      <SectionHeading
        title="Find Crafts"
        subtitle="Search and filter for handicrafts using the options below."
      />
      
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <FilterSidebar
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
          <div style={{ border: "1px solid black", padding: "10px", marginBottom: "20px" }}>
            <h3 style={{ margin: 0 }}>Showing Results</h3>
            <p style={{ margin: "5px 0" }}>{filtered.length} crafts found</p>
            <div style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
              Note: Results are filtered by state, category, material, and technique.
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {filtered.map((craft) => (
              <div key={craft.id} style={{ width: "300px" }}>
                <CraftCard craft={craft} onOpen={() => openCraft(craft.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}