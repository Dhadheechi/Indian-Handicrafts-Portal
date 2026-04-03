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
        <div style={{ flex: "1 1 250px", border: "1px solid black", padding: "15px", height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", borderBottom: "1px solid black", marginBottom: "10px" }}>
            Chatbot Help
          </h3>
          {/* <p style={{ fontSize: "0.8rem", color: "grey" }}>Basic frontend demo</p> */}
          <ul style={{ paddingLeft: "20px", fontSize: "0.9rem", lineHeight: "1.6" }}>
            <li>Testing natural language input</li>
            <li>Multilingual support check</li>
            <li>Chat UI presentation</li>
            <li>Suggested craft discovery queries</li>
          </ul>
        </div>

        {/* Right side: Chatbot */}
        <div style={{ flex: "2 1 400px", border: "1px solid black", display: "flex", flexDirection: "column" }}>
          <div style={{ borderBottom: "1px solid black", padding: "10px", background: "#eee" }}>
            <div style={{ fontWeight: "bold" }}>Assistant Shell</div>
            <div style={{ fontSize: "0.8rem" }}>Ask about crafts, GI, types, etc.</div>
          </div>
          
          <div style={{ height: "400px", overflowY: "scroll", padding: "15px", background: "#fff" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "8px 12px",
                  border: "1px solid black",
                  background: msg.role === "user" ? "#000" : "#fff",
                  color: msg.role === "user" ? "#fff" : "#000",
                  fontSize: "0.9rem"
                }}>
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid black", padding: "10px", display: "flex", gap: "10px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question here..."
              style={{ flex: 1, padding: "8px", border: "1px solid black" }}
            />
            <button 
              onClick={send}
              style={{ padding: "8px 15px", border: "1px solid black", cursor: "pointer", background: "#000", color: "#fff" }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}