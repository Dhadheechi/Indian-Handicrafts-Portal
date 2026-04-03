"use client";
import { Craft } from "@/lib/types";
import SectionHeading from "@/components/ui/section-heading";
import type { ReactNode } from "react";

function DetailSection({
  title,
  children,
}: {
  icon?: any;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ border: "1px solid black", padding: "15px", marginBottom: "10px" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 10px 0", borderBottom: "1px solid grey" }}>{title}</h3>
      <div style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>{children}</div>
    </div>
  );
}

export default function CraftDetail({ craft }: { craft: Craft | undefined }) {
  if (!craft) return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      No craft selected. Please go to the Crafts page to select one.
    </div>
  );

  return (
    <section style={{ padding: "20px" }}>
      <SectionHeading
        title="Craft Detailed Information"
        subtitle="Full information about this specific handicraft."
      />

      <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid black", paddingBottom: "10px", marginBottom: "15px" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{craft.name}</h2>
            <p style={{ color: "grey", margin: "5px 0" }}>{craft.state}, {craft.district}</p>
          </div>
          <div style={{ border: "2px solid green", color: "green", padding: "5px 10px", fontWeight: "bold" }}>
            {craft.gi ? "GI PROTECTED" : "AUTHENTIC PROVENANCE"}
          </div>
        </div>

        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "20px" }}>{craft.summary}</p>

        <div style={{ fontSize: "0.9rem" }}>
          <strong>Tags:</strong> {craft.category}, {craft.material}, {craft.technique}
          <br />
          <strong>Languages:</strong> {craft.language.join(", ")}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1 1 400px" }}>
          <DetailSection title="History">{craft.history}</DetailSection>
          <DetailSection title="How to check Authenticity">{craft.authenticity}</DetailSection>
        </div>
        <div style={{ flex: "1 1 400px" }}>
          <DetailSection title="Artisan Info">{craft.artisan}</DetailSection>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ border: "1px solid grey", padding: "10px" }}>
              <strong>Material:</strong><br />{craft.material}
            </div>
            <div style={{ border: "1px solid grey", padding: "10px" }}>
              <strong>Technique:</strong><br />{craft.technique}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}