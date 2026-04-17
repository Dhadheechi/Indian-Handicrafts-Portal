"use client";
import SectionHeading from "@/components/ui/section-heading";
import Link from "next/link";

export default function StateMap() {
  const mapStates = [
    { name: "Rajasthan" },
    { name: "Telangana" },
    { name: "Karnataka" },
    { name: "Andhra Pradesh" },
    { name: "Tamil Nadu" },
    { name: "Gujarat" },
    { name: "West Bengal" },
  ];

  return (
    <section style={{ padding: "20px" }}>
      <SectionHeading
        title="Explore by State"
        subtitle="Click on a state name to see its traditional handicrafts."
      />
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Left side: State List */}
        <div style={{ flex: "1 1 300px", border: "1px solid #cfb9a2", padding: "20px", borderRadius: "14px", background: "#fffaf3", boxShadow: "0 8px 24px rgba(89, 60, 38, 0.07)" }}>
          <h3 style={{ borderBottom: "1px solid #d8c5b3", paddingBottom: "10px", marginBottom: "15px", marginTop: 0, color: "#2f2116" }}>
            Select a State
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mapStates.map((state) => (
              <li key={state.name} style={{ marginBottom: "10px" }}>
                <Link
                  href={`/crafts?state=${encodeURIComponent(state.name)}`}
                  style={{ 
                    display: "inline-block",
                    width: "100%", 
                    padding: "10px 12px", 
                    textAlign: "left", 
                    border: "1px solid #c9b09a", 
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: "#fffdf9",
                    color: "#4c3727",
                    fontWeight: 600,
                    textDecoration: "none"
                  }}
                >
                  {state.name} &raquo;
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side: Instructions */}
        <div style={{ flex: "1 1 300px", border: "1px solid #d7c5b3", padding: "20px", background: "linear-gradient(160deg, #fff5e8 0%, #f4e6d3 100%)", borderRadius: "14px", color: "#443326" }}>
          <h3 style={{ marginTop: 0, color: "#2f2015" }}>How to use this map tool</h3>
          <ol style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Pick a state from the list on the left.</li>
            <li>The system will filter the crafts based on your choice.</li>
            <li>You will be taken to the "Crafts" page automatically.</li>
            <li>There you can see more specific details and history.</li>
          </ol>
          <div style={{ marginTop: "20px", fontSize: "0.8rem", color: "#705c4d" }}>
            *Note: This is a placeholder list simulating a map interaction.
          </div>
        </div>
      </div>
    </section>
  );
}