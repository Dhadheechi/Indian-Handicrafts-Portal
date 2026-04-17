"use client";
import { useState } from "react";
import { chatbotSeed, languageLabels } from "@/data/crafts";
import SectionHeading from "@/components/ui/section-heading";

export default function Chatbot({
  language,
  selectedState,
}: {
  language: keyof typeof languageLabels;
  selectedState: string;
}) {
  const [messages, setMessages] = useState(chatbotSeed);
  const [input, setInput] = useState("");
  const t = languageLabels[language];

  const generateReply = (text: string) => {
    const q = text.toLowerCase();
    if (q.includes("telangana") || q.includes("ikat")) {
      return "You may want to explore Pochampally Ikat. It is shown with GI-focused presentation, material metadata, and standardized craft detail sections.";
    }
    if (q.includes("gi")) {
      return "The frontend highlights GI identity through visible badges on cards and detail pages so users can quickly identify authenticity-linked crafts.";
    }
    if (q.includes("wood") || q.includes("toy")) {
      return "Woodcraft results include Channapatna Toys and Kondapalli Toys. You can browse them through category, material, and technique filters.";
    }
    if (selectedState !== "All") {
      return `You currently have ${selectedState} selected in discovery. The assistant can guide users toward state-specific craft pages and filtered results.`;
    }
    return "This frontend assistant is ready for craft questions, multilingual support, map-based discovery, and GI-oriented guidance. The backend can be connected later.";
  };
  
  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const reply = generateReply(userText);
    setMessages((prev) => [...prev, { role: "user", text: userText }, { role: "assistant", text: reply }]);
    setInput("");
  };

  return (
    <section style={{ padding: "20px" }}>
      <SectionHeading
        title="Chat with our Assistant"
        subtitle="Ask questions about handicrafts and get basic guidance."
      />
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Left side: Info box */}
        <div style={{ flex: "1 1 250px", border: "1px solid #ceb8a2", padding: "15px", height: "fit-content", borderRadius: "14px", background: "#fffaf3", boxShadow: "0 10px 24px rgba(86, 58, 36, 0.07)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, borderBottom: "1px solid #dbc8b5", marginBottom: "10px", marginTop: 0, color: "#2f2116" }}>
            Chatbot Help
          </h3>
          {/* <p style={{ fontSize: "0.8rem", color: "grey" }}>Basic frontend demo</p> */}
          <ul style={{ paddingLeft: "20px", fontSize: "0.9rem", lineHeight: "1.7", color: "#4e3d30" }}>
            <li>Testing natural language input</li>
            <li>Multilingual support check</li>
            <li>Chat UI presentation</li>
            <li>Suggested craft discovery queries</li>
          </ul>
        </div>

        {/* Right side: Chatbot */}
        <div style={{ flex: "2 1 400px", border: "1px solid #ceb8a2", display: "flex", flexDirection: "column", borderRadius: "14px", overflow: "hidden", background: "#fffaf4", boxShadow: "0 12px 28px rgba(89, 61, 39, 0.08)" }}>
          <div style={{ borderBottom: "1px solid #dbc8b5", padding: "12px", background: "linear-gradient(135deg, #f4e3cf 0%, #edd5be 100%)" }}>
            <div style={{ fontWeight: 700, color: "#3d2a1c" }}>Assistant Shell</div>
            <div style={{ fontSize: "0.8rem", color: "#654c3a" }}>Ask about crafts, GI, types, etc.</div>
          </div>
          
          <div style={{ height: "400px", overflowY: "scroll", padding: "15px", background: "#fffdf9" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "9px 12px",
                  border: msg.role === "user" ? "1px solid #935034" : "1px solid #d6c3b1",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "#9e4f2f" : "#fff9f3",
                  color: msg.role === "user" ? "#fffaf5" : "#2e2117",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 12px rgba(79, 54, 35, 0.06)"
                }}>
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #dbc8b5", padding: "10px", display: "flex", gap: "10px", background: "#fff6eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question here..."
              style={{ flex: 1, padding: "10px", border: "1px solid #c9b09a", borderRadius: "10px", background: "#fffdf9", color: "#3d2a1d" }}
            />
            <button 
              onClick={send}
              style={{ padding: "10px 15px", border: "1px solid #935034", borderRadius: "10px", cursor: "pointer", background: "#9e4f2f", color: "#fff9f2", fontWeight: 700 }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}