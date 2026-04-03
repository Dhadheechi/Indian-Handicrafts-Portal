"use client";
import SectionHeading from "@/components/ui/section-heading";

export default function StateMap({
  navigate,
  setSelectedState,
}: {
  navigate: (page: string) => void;
  setSelectedState: (state: string) => void;
}) {
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
        <div style={{ flex: "1 1 300px", border: "1px solid black", padding: "20px" }}>
          <h3 style={{ borderBottom: "1px solid black", paddingBottom: "10px", marginBottom: "15px" }}>
            Select a State
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mapStates.map((state) => (
              <li key={state.name} style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => {
                    setSelectedState(state.name);
                    navigate("crafts");
                  }}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    textAlign: "left", 
                    border: "1px solid grey", 
                    cursor: "pointer",
                    background: "#f9f9f9"
                  }}
                >
                  {state.name} &raquo;
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side: Instructions */}
        <div style={{ flex: "1 1 300px", border: "1px solid grey", padding: "20px", background: "#f0f0f0" }}>
          <h3 style={{ marginTop: 0 }}>How to use this map tool</h3>
          <ol style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Pick a state from the list on the left.</li>
            <li>The system will filter the crafts based on your choice.</li>
            <li>You will be taken to the "Crafts" page automatically.</li>
            <li>There you can see more specific details and history.</li>
          </ol>
          <div style={{ marginTop: "20px", fontSize: "0.8rem", color: "#666" }}>
            *Note: This is a placeholder list simulating a map interaction.
          </div>
        </div>
      </div>
    </section>
  );
}