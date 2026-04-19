"use client";

export default function FilterSidebar({
  states,
  filters,
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  selectedMaterial,
  setSelectedMaterial,
  selectedTechnique,
  setSelectedTechnique,
}: {
  states: string[];
  filters: {
    category: string[];
    material: string[];
    technique: string[];
  };
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
    <div style={{ border: "1px solid #ccb8a3", padding: "14px", width: "250px", borderRadius: "14px", background: "#fffaf3", boxShadow: "0 8px 24px rgba(82, 56, 36, 0.07)" }}>
      <h3 style={{ borderBottom: "1px solid #d8c7b4", paddingBottom: "7px", marginTop: 0, marginBottom: "8px", color: "#302116" }}>Filters</h3>
      <p style={{ fontSize: "0.82rem", color: "#705e51", marginTop: 0 }}>Find crafts by metadata</p>
      
      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#3c2a1e" }}>State</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {states.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedState(s)}
              style={{ padding: "4px 9px", border: "1px solid #c7af98", background: selectedState === s ? "#e8d7c5" : "#fffdf9", cursor: "pointer", fontSize: "0.78rem", borderRadius: "999px", color: "#4a3525", fontWeight: 600 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#3c2a1e" }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {filters.category.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedCategory(s)}
              style={{ padding: "4px 9px", border: "1px solid #c7af98", background: selectedCategory === s ? "#e8d7c5" : "#fffdf9", cursor: "pointer", fontSize: "0.78rem", borderRadius: "999px", color: "#4a3525", fontWeight: 600 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#3c2a1e" }}>Material</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {filters.material.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedMaterial(s)}
              style={{ padding: "4px 9px", border: "1px solid #c7af98", background: selectedMaterial === s ? "#e8d7c5" : "#fffdf9", cursor: "pointer", fontSize: "0.78rem", borderRadius: "999px", color: "#4a3525", fontWeight: 600 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#3c2a1e" }}>Technique</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
          {filters.technique.map((s) => (
            <button 
              key={s} 
              onClick={() => setSelectedTechnique(s)}
              style={{ padding: "4px 9px", border: "1px solid #c7af98", background: selectedTechnique === s ? "#e8d7c5" : "#fffdf9", cursor: "pointer", fontSize: "0.78rem", borderRadius: "999px", color: "#4a3525", fontWeight: 600 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}