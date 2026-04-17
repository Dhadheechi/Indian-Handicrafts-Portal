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
    <div style={{ border: "1px solid #d2bda8", padding: "15px", marginBottom: "10px", borderRadius: "12px", background: "#fffaf4", boxShadow: "0 8px 20px rgba(84, 57, 37, 0.06)" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 10px 0", borderBottom: "1px solid #decdbc", color: "#2d2016", paddingBottom: "8px" }}>{title}</h3>
      <div style={{ fontSize: "0.92rem", lineHeight: "1.65", color: "#4a3a2d" }}>{children}</div>
    </div>
  );
}

export default function CraftDetail({ craft }: { craft: Craft | undefined }) {
  if (!craft) return (
    <div style={{ padding: "20px", textAlign: "center", color: "#5d4b3f" }}>
      No craft selected. Please go to the Crafts page to select one.
    </div>
  );

  return (
    <section style={{ padding: "20px" }}>
      <SectionHeading
        title="Craft Detailed Information"
        subtitle="Full information about this specific handicraft."
      />

      <div style={{ border: "1px solid #cfb9a2", padding: "20px", marginBottom: "20px", borderRadius: "16px", background: "linear-gradient(150deg, #fff9f1 0%, #f6eadc 100%)", boxShadow: "0 12px 28px rgba(89, 61, 39, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid #dbc9b7", paddingBottom: "10px", marginBottom: "15px" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#2f2015" }}>{craft.name}</h2>
            <p style={{ color: "#6d5a4b", margin: "5px 0" }}>{craft.state}, {craft.district}</p>
          </div>
          <div style={{ border: "1px solid #5f894d", color: "#2f6130", padding: "5px 10px", fontWeight: 700, borderRadius: "999px", background: "#e9f4e5", height: "fit-content" }}>
            {craft.gi ? "GI PROTECTED" : "AUTHENTIC PROVENANCE"}
          </div>
        </div>

        <p style={{ fontSize: "1.08rem", lineHeight: "1.68", marginBottom: "20px", color: "#47372a" }}>{craft.summary}</p>

        <div style={{ fontSize: "0.9rem", color: "#4f3f32" }}>
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
            <div style={{ border: "1px solid #d3bfaa", padding: "10px", borderRadius: "10px", background: "#fffaf3", color: "#463527" }}>
              <strong>Material:</strong><br />{craft.material}
            </div>
            <div style={{ border: "1px solid #d3bfaa", padding: "10px", borderRadius: "10px", background: "#fffaf3", color: "#463527" }}>
              <strong>Technique:</strong><br />{craft.technique}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}