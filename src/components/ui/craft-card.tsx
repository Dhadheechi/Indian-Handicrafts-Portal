"use client";
import { Craft } from "@/lib/types";

export default function CraftCard({
  craft,
  onOpen,
}: {
  craft: Craft;
  onOpen: () => void;
}) {
  return (
    <div style={{ border: "1px solid #cfb9a2", borderRadius: "14px", padding: "15px", marginBottom: "15px", background: "#fffaf4", boxShadow: "0 10px 24px rgba(89, 61, 39, 0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#2d2015" }}>{craft.name}</h3>
          <p style={{ fontSize: "0.8rem", color: "#6b5a4b" }}>{craft.state}, {craft.district}</p>
        </div>
        <div style={{ border: "1px solid #b49478", borderRadius: "999px", background: "#f5e8db", color: "#6d3d22", padding: "3px 8px", fontSize: "0.7rem", height: "fit-content", fontWeight: 700 }}>
          {craft.gi ? "GI Status: YES" : "GI Status: NO"}
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", marginBottom: "10px", color: "#4d3d30" }}>{craft.summary}</p>

      <div style={{ fontSize: "0.8rem", color: "#8e4428", marginBottom: "10px", fontWeight: 600 }}>
        Categories: {craft.category}, {craft.material}, {craft.technique}
      </div>

      <button 
        onClick={onOpen}
        style={{ width: "100%", padding: "8px", border: "1px solid #8e4428", borderRadius: "10px", cursor: "pointer", background: "#9e4f2f", color: "#fff8f3", fontWeight: 700 }}
      >
        [Read more about this craft]
      </button>
    </div>
  );
}