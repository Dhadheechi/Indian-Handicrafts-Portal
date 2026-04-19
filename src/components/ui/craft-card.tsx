"use client";
import { Craft } from "@/lib/types";

export default function CraftCard({
  craft,
  categoryTag,
  techniqueTag,
  onOpen,
}: {
  craft: Craft;
  categoryTag: string;
  techniqueTag: string;
  onOpen: () => void;
}) {
  return (
    <div style={{ 
      border: "1px solid #cfb9a2", 
      borderRadius: "14px", 
      padding: "20px", 
      background: "#fffaf4", 
      boxShadow: "0 10px 24px rgba(89, 61, 39, 0.07)",
      height: "320px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflow: "hidden",
      position: "relative",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#2d2015", lineHeight: "1.2" }}>{craft.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "#6b5a4b", margin: "4px 0 0 0" }}>{craft.state}, {craft.district || "Generic"}</p>
          </div>
          <div style={{ 
            border: "1px solid #b49478", 
            borderRadius: "999px", 
            background: "#f5e8db", 
            color: "#6d3d22", 
            padding: "3px 10px", 
            fontSize: "0.7rem", 
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}>
            {craft.gi ? "GI" : "NO GI"}
          </div>
        </div>
  
        <p style={{ 
          fontSize: "0.9rem", 
          lineHeight: "1.6",
          color: "#4d3d30",
          margin: "15px 0",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {craft.summary}
        </p>
  
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "10px 0" }}>
          <span style={{ fontSize: "0.75rem", color: "#8e4428", background: "#fdf1ea", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
            {categoryTag}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#4d3d30", background: "#f0ece6", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
            {techniqueTag}
          </span>
        </div>
      </div>

      <button 
        onClick={onOpen}
        style={{ 
          width: "100%", 
          padding: "12px", 
          border: "none", 
          borderRadius: "10px", 
          cursor: "pointer", 
          background: "#9e4f2f", 
          color: "#fff8f3", 
          fontWeight: 700,
          fontSize: "0.95rem",
          transition: "background 0.2s ease"
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#8c4428")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#9e4f2f")}
      >
        View Details
      </button>
    </div>
  );
}