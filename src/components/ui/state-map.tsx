"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "@/components/ui/section-heading";
import dynamic from "next/dynamic";

// Dynamically import with SSR disabled since the map uses browser APIs
const IndiaMap = dynamic(() => import("react-svgmap-india"), { ssr: false });

// State code to full name mapping (SVG paths use 2-letter IDs)
const stateCodeToName: Record<string, string> = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CH: "Chandigarh",
  CT: "Chhattisgarh",
  DD: "Daman and Diu",
  DL: "Delhi",
  DN: "Dadra and Nagar Haveli",
  GA: "Goa",
  GJ: "Gujarat",
  HP: "Himachal Pradesh",
  HR: "Haryana",
  JH: "Jharkhand",
  JK: "Jammu and Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MH: "Maharashtra",
  ML: "Meghalaya",
  MN: "Manipur",
  MP: "Madhya Pradesh",
  MZ: "Mizoram",
  NL: "Nagaland",
  OR: "Odisha",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TG: "Telangana",
  TN: "Tamil Nadu",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UT: "Uttarakhand",
  WB: "West Bengal",
};

// Craft count per state (for the info tooltip)
const statesWithCrafts: Record<string, string[]> = {
  "Andhra Pradesh": ["Stone Carving", "Leather Puppetry", "Bell & Brass Craft", "Bobbili Veena"],
  "Bihar": ["Applique Work", "Bhagalpur Silk", "Madhubani Painting"],
  "Chhattisgarh": ["Bastar Iron Craft", "Bastar Wooden Craft", "Champa Silk"],
  "Gujarat": ["Agates of Cambay", "Kutch Embroidery", "Patan Patola"],
  "Himachal Pradesh": ["Chamba Chappal", "Chamba Rumal", "Kullu Shawl"],
  "Karnataka": ["Bidriware", "Channapatna Toys", "Mysore Silk"],
  "Kerala": ["Alleppey Coir", "Aranmula Kannadi", "Kasavu Sarees"],
  "Madhya Pradesh": ["Bagh Prints", "Bell Metal Ware", "Chanderi Sarees"],
  "Maharashtra": ["Kolhapuri Chappal", "Paithani Saree", "Warli Painting"],
  "Nagaland": ["Chakhesang Shawls", "Naga Weaving"],
  "Odisha": ["Bomkai Saree", "Pattachitra", "Silver Filigree"],
  "Punjab": ["Phulkari", "Jutti Craft"],
  "Rajasthan": ["Bagru Block Print", "Blue Pottery", "Lac Bangles"],
  "Tamil Nadu": ["Arani Silk", "Thanjavur Painting", "Bronze Casting"],
  "Telangana": ["Adilabad Dokra", "Cheriyal Paintings", "Nirmal Toys"],
  "Uttar Pradesh": ["Agra Durrie", "Banaras Brocades", "Chikankari"],
  "West Bengal": ["Baluchari Saree", "Bengal Patachitra", "Dokra Craft"],
};

// Vibrant color palette matching the reference image
const stateColors: Record<string, string> = {
  "Jammu and Kashmir": "#7BC8F6",
  "Ladakh": "#89CFF0",
  "Himachal Pradesh": "#FFD700",
  "Punjab": "#FF69B4",
  "Uttarakhand": "#87CEEB",
  "Haryana": "#DDA0DD",
  "Delhi": "#FF6B6B",
  "Rajasthan": "#87CEEB",
  "Uttar Pradesh": "#FF85A2",
  "Bihar": "#FFD700",
  "Sikkim": "#98FB98",
  "Arunachal Pradesh": "#7BC8F6",
  "Nagaland": "#FFD700",
  "Manipur": "#90EE90",
  "Mizoram": "#FF69B4",
  "Tripura": "#DDA0DD",
  "Meghalaya": "#FF85A2",
  "Assam": "#4169E1",
  "West Bengal": "#4169E1",
  "Jharkhand": "#FFD700",
  "Odisha": "#FF85A2",
  "Chhattisgarh": "#90EE90",
  "Madhya Pradesh": "#98D47D",
  "Gujarat": "#FFD700",
  "Maharashtra": "#4169E1",
  "Telangana": "#FFD700",
  "Andhra Pradesh": "#FF85A2",
  "Karnataka": "#98D47D",
  "Goa": "#FF6B6B",
  "Kerala": "#FF85A2",
  "Tamil Nadu": "#90EE90",
  "Lakshadweep": "#87CEEB",
  "Andaman and Nicobar Islands": "#DDA0DD",
  "Puducherry": "#FFD700",
  "Chandigarh": "#98FB98",
  "Dadra and Nagar Haveli": "#90EE90",
  "Daman and Diu": "#FF69B4",
};

export default function StateMap() {
  const [selectedState, setSelectedState] = useState<string>("");
  const [hoveredState, setHoveredState] = useState<string>("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detect hovered state from SVG path elements
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as SVGElement;
      const rect = mapContainerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      // Walk up to find a path with an id
      let el: Element | null = target;
      while (el && el.tagName !== "svg") {
        if (el.tagName === "path" && el.id && stateCodeToName[el.id]) {
          setHoveredState(stateCodeToName[el.id]);
          return;
        }
        el = el.parentElement;
      }
      setHoveredState("");
    },
    []
  );

  const handleStateClick = useCallback(
    (stateName: string) => {
      setSelectedState(stateName);
      // Navigate after a brief delay so the user sees the selection
      setTimeout(() => {
        router.push(`/crafts?state=${encodeURIComponent(stateName)}`);
      }, 600);
    },
    [router]
  );

  const currentState = hoveredState || selectedState;
  const crafts = currentState ? statesWithCrafts[currentState] : null;

  return (
    <section
      style={{
        padding: "40px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <SectionHeading
        title="Explore by State"
        subtitle="Hover over the map to discover crafts. Click a state to explore its handicrafts."
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "32px",
          alignItems: "flex-start",
          marginTop: "28px",
        }}
      >
        {/* Left: Interactive Map */}
        <div
          style={{
            flex: "1 1 480px",
            minWidth: "320px",
            position: "relative",
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #fffaf3 0%, #f7eed9 100%)",
              borderRadius: "20px",
              border: "1px solid #cfb9a2",
              padding: "24px",
              boxShadow: "0 12px 40px rgba(89, 60, 38, 0.10)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative background pattern */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `radial-gradient(circle at 25% 25%, #9e4f2f 1px, transparent 1px),
                                  radial-gradient(circle at 75% 75%, #9e4f2f 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: currentState ? "#4caf50" : "#9e4f2f",
                  boxShadow: currentState
                    ? "0 0 8px rgba(76, 175, 80, 0.5)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#705c4d",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {currentState
                  ? `📍 ${currentState}`
                  : "Hover over a state to begin"}
              </span>
            </div>

            <div
              ref={mapContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredState("")}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <IndiaMap
                onClick={handleStateClick}
                size="100%"
                mapColor="#f5e6d0"
                strokeColor="#9e4f2f"
                strokeWidth="0.8"
                hoverColor="#d4895a"
              />

              {/* Floating tooltip that follows the cursor */}
              {hoveredState && (
                <div
                  style={{
                    position: "absolute",
                    left: tooltipPos.x + 14,
                    top: tooltipPos.y - 38,
                    pointerEvents: "none",
                    zIndex: 50,
                    background: "linear-gradient(135deg, #2f2116 0%, #4c3727 100%)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    transform: "translateY(-4px)",
                    transition: "opacity 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>📍</span>
                  {hoveredState}
                  {statesWithCrafts[hoveredState] && (
                    <span
                      style={{
                        marginLeft: "4px",
                        fontSize: "0.7rem",
                        opacity: 0.7,
                        fontWeight: 400,
                      }}
                    >
                      • {statesWithCrafts[hoveredState].length}+ crafts
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: State Info Panel */}
        <div
          style={{
            flex: "1 1 300px",
            minWidth: "280px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Info Card */}
          <div
            style={{
              border: "1px solid #cfb9a2",
              borderRadius: "20px",
              padding: "28px",
              background: "linear-gradient(160deg, #fffaf3 0%, #f4e6d3 100%)",
              boxShadow: "0 8px 24px rgba(89, 60, 38, 0.07)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {currentState ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #9e4f2f, #c4713f)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      boxShadow: "0 4px 12px rgba(158, 79, 47, 0.3)",
                    }}
                  >
                    🏛️
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "#2f2116",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                      }}
                    >
                      {currentState}
                    </h3>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "0.8rem",
                        color: "#8a7464",
                      }}
                    >
                      {crafts
                        ? `${crafts.length}+ traditional crafts`
                        : "Crafts data available"}
                    </p>
                  </div>
                </div>

                {crafts && (
                  <div style={{ marginBottom: "20px" }}>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#8a7464",
                        margin: "0 0 10px 0",
                        fontWeight: 600,
                      }}
                    >
                      Featured Crafts
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {crafts.map((craft) => (
                        <span
                          key={craft}
                          style={{
                            display: "inline-block",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            background: "rgba(158, 79, 47, 0.08)",
                            border: "1px solid rgba(158, 79, 47, 0.15)",
                            fontSize: "0.8rem",
                            color: "#6b4226",
                            fontWeight: 500,
                          }}
                        >
                          {craft}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() =>
                    router.push(
                      `/crafts?state=${encodeURIComponent(currentState)}`
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #9e4f2f, #b8663d)",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(158, 79, 47, 0.3)",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(158, 79, 47, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(158, 79, 47, 0.3)";
                  }}
                >
                  Explore {currentState} Crafts →
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "16px",
                    filter: "grayscale(0.3)",
                  }}
                >
                  🗺️
                </div>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: "#2f2116",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                  }}
                >
                  Discover India&apos;s Crafts
                </h3>
                <p
                  style={{
                    color: "#705c4d",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Hover over any state on the map to see its handicraft
                  traditions, then click to explore the full collection.
                </p>
              </div>
            )}
          </div>

          {/* Quick Access List */}
          <div
            style={{
              border: "1px solid #cfb9a2",
              borderRadius: "20px",
              padding: "24px",
              background: "#fffaf3",
              boxShadow: "0 8px 24px rgba(89, 60, 38, 0.07)",
            }}
          >
            <h4
              style={{
                margin: "0 0 14px 0",
                color: "#2f2116",
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Popular States
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {[
                "Rajasthan",
                "Tamil Nadu",
                "Karnataka",
                "West Bengal",
                "Gujarat",
                "Kerala",
                "Uttar Pradesh",
              ].map((state) => (
                <button
                  key={state}
                  onClick={() =>
                    router.push(
                      `/crafts?state=${encodeURIComponent(state)}`
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid transparent",
                    background:
                      currentState === state
                        ? "rgba(158, 79, 47, 0.08)"
                        : "transparent",
                    color: "#4c3727",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(158, 79, 47, 0.06)";
                    e.currentTarget.style.borderColor =
                      "rgba(158, 79, 47, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      currentState === state
                        ? "rgba(158, 79, 47, 0.08)"
                        : "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <span>{state}</span>
                  <span style={{ color: "#9e4f2f", fontSize: "0.85rem" }}>
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}