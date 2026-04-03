"use client";
import { useState } from "react";

export default function TopNav({
  language,
  setLanguage,
  navigate,
}: {
  language: string;
  setLanguage: (value: string) => void;
  navigate: (page: string) => void;
}) {
  const links = [
    ["home", "Home"],
    ["map", "Map"],
    ["crafts", "Crafts"],
    ["detail", "Craft Detail"],
    ["chatbot", "Chatbot"],
  ];

  return (
    <header style={{ borderBottom: "2px solid black", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <button onClick={() => navigate("home")} style={{ fontWeight: "bold", fontSize: "1.2rem", background: "none", border: "none", cursor: "pointer" }}>
          Indian Handicrafts Portal
        </button>
        {/* <div style={{ fontSize: "0.8rem" }}>Novice frontend build</div> */}
      </div>

      <nav>
        <ul style={{ display: "flex", gap: "10px", listStyle: "none", margin: 0, padding: 0 }}>
          {links.map(([key, label]) => (
            <li key={key}>
              <button 
                onClick={() => navigate(key)} 
                style={{ padding: "5px 10px", border: "1px solid grey", cursor: "pointer" }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        Language: 
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginLeft: "5px" }}>
          <option value="English">EN</option>
          <option value="Hindi">HI</option>
          <option value="Telugu">TE</option>
        </select>
      </div>
    </header>
  );
}