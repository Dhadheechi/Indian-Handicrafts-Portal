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
    <div style={{ border: "1px solid black", padding: "15px", marginBottom: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>{craft.name}</h3>
          <p style={{ fontSize: "0.8rem", color: "grey" }}>{craft.state}, {craft.district}</p>
        </div>
        <div style={{ border: "1px solid black", padding: "2px 5px", fontSize: "0.7rem", height: "fit-content" }}>
          {craft.gi ? "GI Status: YES" : "GI Status: NO"}
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", marginBottom: "10px" }}>{craft.summary}</p>

      <div style={{ fontSize: "0.8rem", color: "blue", marginBottom: "10px" }}>
        Categories: {craft.category}, {craft.material}, {craft.technique}
      </div>

      <button 
        onClick={onOpen}
        style={{ width: "100%", padding: "5px", border: "1px solid black", cursor: "pointer" }}
      >
        [Read more about this craft]
      </button>
    </div>
  );
}