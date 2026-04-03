"use client";

import { filters, states } from "@/data/crafts";

export default function FilterSidebar({
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  selectedMaterial,
  setSelectedMaterial,
  selectedTechnique,
  setSelectedTechnique,
}: {
  selectedState: string;
  setSelectedState: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (v: string) => void;
  selectedTechnique: string;
  setSelectedTechnique: (v: string) => void;
}) {
  return (
    <div style={{ border: "1px solid black", padding: "10px", width: "250px" }}>
      <h3 style={{ borderBottom: "1px solid black", paddingBottom: "5px" }}>Filters</h3>
      <p style={{ fontSize: "0.8rem", color: "grey" }}>Find crafts by metadata</p>
      
      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>State</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {states.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedState(s)}
              style={{ padding: "3px 8px", border: "1px solid grey", background: selectedState === s ? "#ddd" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {filters.category.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedCategory(s)}
              style={{ padding: "3px 8px", border: "1px solid grey", background: selectedCategory === s ? "#ddd" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Material</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {filters.material.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedMaterial(s)}
              style={{ padding: "3px 8px", border: "1px solid grey", background: selectedMaterial === s ? "#ddd" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Technique</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {filters.technique.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedTechnique(s)}
              style={{ padding: "3px 8px", border: "1px solid grey", background: selectedTechnique === s ? "#ddd" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}