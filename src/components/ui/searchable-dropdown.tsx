"use client";

import { useState, useRef, useEffect } from "react";

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", marginBottom: "20px" }}>
      {label && (
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600, color: "#4c3727" }}>
          {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 16px",
          border: "1px solid #cfb9a2",
          borderRadius: "10px",
          background: "#fff",
          cursor: "pointer",
          fontSize: "0.95rem",
          color: value ? "#2d2015" : "#a39081",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "inset 0 2px 4px rgba(89, 60, 38, 0.03)",
        }}
      >
        {value || placeholder}
        <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>▼</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #cfb9a2",
            borderRadius: "10px",
            marginTop: "4px",
            boxShadow: "0 10px 25px rgba(89, 60, 38, 0.15)",
            zIndex: 100,
            maxHeight: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #f0ece6" }}>
            <input
              type="text"
              autoFocus
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e5d5c5",
                borderRadius: "6px",
                fontSize: "0.9rem",
                outline: "none",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "background 0.2s ease",
                    background: value === option ? "#fdf1ea" : "transparent",
                    color: value === option ? "#9e4f2f" : "#4c3727",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f7eed9")}
                  onMouseOut={(e) => (e.currentTarget.style.background = value === option ? "#fdf1ea" : "transparent")}
                >
                  {option}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px", textAlign: "center", color: "#a39081", fontSize: "0.85rem" }}>
                No states found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
