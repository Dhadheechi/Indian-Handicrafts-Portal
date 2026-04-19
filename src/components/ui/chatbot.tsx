"use client";
import { Fragment, ReactNode, useState } from "react";
import { chatbotSeed, languageLabels } from "@/data/crafts";
import SectionHeading from "@/components/ui/section-heading";

type ChatSource = {
  id: number;
  name: string;
  state: string;
  category: string;
  gi: boolean;
};

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  sources?: ChatSource[];
};

type GIPreference = "any" | "gi" | "non-gi";

type AppliedFilters = {
  states: string[];
  categories: string[];
  materials: string[];
  techniques: string[];
  giPreference: GIPreference;
};

type ChatApiResponse = {
  reply: string;
  sources?: ChatSource[];
  appliedFilters?: AppliedFilters;
};

function renderLineWithLinks(line: string): ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = linkRegex.exec(line)) !== null) {
    const [fullMatch, label, href] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      nodes.push(line.slice(lastIndex, matchIndex));
    }

    nodes.push(
      <a
        key={`${label}-${href}-${matchIndex}`}
        href={href}
        style={{ color: "#7d3e24", textDecoration: "underline", fontWeight: 600 }}
      >
        {label}
      </a>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  if (nodes.length === 0) {
    return line;
  }

  return nodes.map((node, index) => <Fragment key={`n-${index}`}>{node}</Fragment>);
}

function renderMessageText(text: string): ReactNode {
  const lines = text.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
      {lines.map((line, index) => (
        <div key={`line-${index}`} style={{ whiteSpace: "pre-wrap" }}>
          {renderLineWithLinks(line)}
        </div>
      ))}
    </div>
  );
}

export default function Chatbot({
  language,
  selectedState,
}: {
  language: keyof typeof languageLabels;
  selectedState: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatbotSeed);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAppliedFilters, setLastAppliedFilters] = useState<AppliedFilters | null>(null);
  
  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          selectedState,
          language,
          contextFilters: lastAppliedFilters,
          history: messages.slice(-10).map((msg) => ({ role: msg.role, text: msg.text })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chatbot response");
      }

      const data = (await response.json()) as ChatApiResponse;
      setLastAppliedFilters(data.appliedFilters || null);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I could not reach the chat service right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
            <div style={{ fontSize: "0.8rem", color: "#654c3a" }}>
              Ask about crafts, GI, materials, techniques, and state-wise recommendations.
            </div>
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
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>
                  {renderMessageText(msg.text)}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: "8px", borderTop: "1px solid #e6d6c9", paddingTop: "6px" }}>
                      <div style={{ fontSize: "0.78rem", opacity: 0.85, marginBottom: "4px" }}>Sources:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {msg.sources.map((source) => (
                          <a
                            key={source.id}
                            href={`/detail?id=${source.id}`}
                            style={{
                              fontSize: "0.74rem",
                              border: "1px solid #d6c3b1",
                              borderRadius: "999px",
                              padding: "3px 8px",
                              color: "#5a402d",
                              textDecoration: "none",
                              background: "#fff8ef",
                            }}
                          >
                            {source.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    maxWidth: "80%",
                    padding: "9px 12px",
                    border: "1px solid #d6c3b1",
                    borderRadius: "12px",
                    background: "#fff9f3",
                    color: "#2e2117",
                    fontSize: "0.9rem",
                    boxShadow: "0 4px 12px rgba(79, 54, 35, 0.06)",
                  }}
                >
                  <strong>Bot:</strong> Thinking...
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #dbc8b5", padding: "10px", display: "flex", gap: "10px", background: "#fff6eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question here..."
              disabled={isLoading}
              style={{ flex: 1, padding: "10px", border: "1px solid #c9b09a", borderRadius: "10px", background: "#fffdf9", color: "#3d2a1d" }}
            />
            <button 
              onClick={send}
              disabled={isLoading}
              style={{ padding: "10px 15px", border: "1px solid #935034", borderRadius: "10px", cursor: "pointer", background: "#9e4f2f", color: "#fff9f2", fontWeight: 700 }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}