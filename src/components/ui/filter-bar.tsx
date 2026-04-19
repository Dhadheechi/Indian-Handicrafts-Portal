"use client";

import { filters, states } from "@/data/crafts";

interface FilterBarProps {
  selectedState: string;
  setSelectedState: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (v: string) => void;
  selectedTechnique: string;
  setSelectedTechnique: (v: string) => void;
}

export default function FilterBar({
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  selectedMaterial,
  setSelectedMaterial,
  selectedTechnique,
  setSelectedTechnique,
}: FilterBarProps) {
  
  const activeFilters = [
    { label: "State", value: selectedState, setter: setSelectedState },
    { label: "Category", value: selectedCategory, setter: setSelectedCategory },
    { label: "Material", value: selectedMaterial, setter: setSelectedMaterial },
    { label: "Technique", value: selectedTechnique, setter: setSelectedTechnique },
  ].filter(f => f.value !== "All");

  const clearAll = () => {
    setSelectedState("All");
    setSelectedCategory("All");
    setSelectedMaterial("All");
    setSelectedTechnique("All");
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      {/* Top Filter Bar */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        padding: "20px", 
        background: "#fffaf4", 
        border: "1px solid #ccb8a3", 
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(82, 56, 36, 0.05)",
        flexWrap: "wrap",
        alignItems: "flex-end"
      }}>
        <div style={filterGroupStyle}>
          <label style={labelStyle}>State / UT</label>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            style={selectStyle}
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={labelStyle}>Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={selectStyle}
          >
            {filters.category.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={labelStyle}>Material</label>
          <select 
            value={selectedMaterial} 
            onChange={(e) => setSelectedMaterial(e.target.value)}
            style={selectStyle}
          >
            {filters.material.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={labelStyle}>Technique</label>
          <select 
            value={selectedTechnique} 
            onChange={(e) => setSelectedTechnique(e.target.value)}
            style={selectStyle}
          >
            {filters.technique.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {activeFilters.length > 0 && (
          <button 
            onClick={clearAll}
            style={{
              padding: "10px 16px",
              background: "#9e4f2f",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s ease"
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "15px", padding: "0 5px" }}>
          {activeFilters.map((f, i) => (
            <div 
              key={i} 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "#fdf1ea",
                border: "1px solid #eccfb5",
                borderRadius: "999px",
                fontSize: "0.8rem",
                color: "#8c5b36",
                fontWeight: 600
              }}
            >
              <span style={{ opacity: 0.7 }}>{f.label}:</span>
              <span>{f.value}</span>
              <button 
                onClick={() => f.setter("All")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "#9e4f2f",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const filterGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  flex: "1 1 200px"
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#6b5a4a",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginLeft: "4px"
};

const selectStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #ccb8a3",
  background: "#fff",
  color: "#302116",
  fontSize: "0.95rem",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239e4f2f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "16px"
};
