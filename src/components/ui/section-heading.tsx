"use client";

export default function SectionHeading({
  title,
  subtitle,
}: {
  icon?: any;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ marginBottom: "22px", borderLeft: "4px solid #9e4f2f", paddingLeft: "15px" }}>
      <h2 style={{ fontSize: "1.95rem", fontWeight: 700, margin: 0, color: "#2c1f15" }}>{title}</h2>
      <p style={{ color: "#5d4b3f", margin: "7px 0 0 0", maxWidth: "72ch" }}>{subtitle}</p>
    </div>
  );
}