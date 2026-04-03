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
    <div style={{ marginBottom: "20px", borderLeft: "4px solid grey", paddingLeft: "15px" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0 }}>{title}</h2>
      <p style={{ color: "grey", margin: "5px 0 0 0" }}>{subtitle}</p>
    </div>
  );
}