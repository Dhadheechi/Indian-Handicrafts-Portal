"use client";
import { Fragment, ReactNode, useEffect, useState } from "react";
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

type StoredChatState = {
  conversationId: string;
  messages: ChatMessage[];
  lastAppliedFilters: AppliedFilters | null;
  updatedAt: number;
};

type ChatHistoryResponse = {
  conversationId: string;
  messages: ChatMessage[];
  lastAppliedFilters: AppliedFilters | null;
};

const CHAT_STORAGE_KEY = "ihp-chatbot-recent-v1";

function createConversationId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidRole(role: unknown): role is ChatMessage["role"] {
  return role === "assistant" || role === "user";
}

function sanitizeStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const role = (item as { role?: unknown }).role;
      const text = (item as { text?: unknown }).text;
      return isValidRole(role) && typeof text === "string";
    })
    .map((item) => {
      const safeItem = item as {
        role: ChatMessage["role"];
        text: string;
        sources?: ChatSource[];
      };
      return {
        role: safeItem.role,
        text: safeItem.text,
        sources: Array.isArray(safeItem.sources) ? safeItem.sources : undefined,
      };
    });
}

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
  const [isClearing, setIsClearing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastAppliedFilters, setLastAppliedFilters] = useState<AppliedFilters | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => createConversationId());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<StoredChatState>;
      const restoredMessages = sanitizeStoredMessages(parsed.messages);

      if (restoredMessages.length > 0) {
        setMessages(restoredMessages.slice(-24));
      }

      if (parsed.conversationId && typeof parsed.conversationId === "string") {
        setConversationId(parsed.conversationId);
      }

      setLastAppliedFilters((parsed.lastAppliedFilters as AppliedFilters | null) || null);
    } catch (error) {
      console.warn("Failed to restore chatbot history", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const controller = new AbortController();
    const loadServerHistory = async () => {
      try {
        const response = await fetch(
          `/api/chat/history?conversationId=${encodeURIComponent(conversationId)}`,
          { method: "GET", signal: controller.signal }
        );

        if (!response.ok) return;

        const payload = (await response.json()) as ChatHistoryResponse;
        const serverMessages = sanitizeStoredMessages(payload.messages);

        if (serverMessages.length > 0) {
          setMessages(serverMessages.slice(-24));
        }

        if (payload.conversationId && payload.conversationId !== conversationId) {
          setConversationId(payload.conversationId);
        }

        if (payload.lastAppliedFilters) {
          setLastAppliedFilters(payload.lastAppliedFilters);
        }
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          console.warn("Failed to load server chat history", error);
        }
      }
    };

    void loadServerHistory();

    return () => controller.abort();
  }, [conversationId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      const payload: StoredChatState = {
        conversationId,
        messages: messages.slice(-24),
        lastAppliedFilters,
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to persist chatbot history", error);
    }
  }, [conversationId, isHydrated, messages, lastAppliedFilters]);

  useEffect(() => {
    if (!isHydrated) return;

    const persistServerHistory = async () => {
      try {
        await fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            messages: messages.slice(-24),
            lastAppliedFilters,
          }),
        });
      } catch (error) {
        console.warn("Failed to persist server chat history", error);
      }
    };

    void persistServerHistory();
  }, [conversationId, isHydrated, messages, lastAppliedFilters]);

  const clearChat = async () => {
    if (isLoading || isClearing) return;

    setIsClearing(true);
    const previousConversationId = conversationId;
    const nextConversationId = createConversationId();

    try {
      await fetch(`/api/chat/history?conversationId=${encodeURIComponent(previousConversationId)}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.warn("Failed to clear server chat history", error);
    } finally {
      setMessages(chatbotSeed);
      setLastAppliedFilters(null);
      setInput("");
      setConversationId(nextConversationId);

      try {
        window.localStorage.removeItem(CHAT_STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to clear local chat history", error);
      }

      setIsClearing(false);
    }
  };
  
  const send = async () => {
    if (!input.trim() || isLoading || isClearing) return;
    const userText = input.trim();
    const nextHistory = [...messages, { role: "user" as const, text: userText }];
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
          history: nextHistory.slice(-10).map((msg) => ({ role: msg.role, text: msg.text })),
          conversationId,
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
            <div style={{ marginTop: "8px" }}>
              <button
                onClick={clearChat}
                disabled={isLoading || isClearing}
                style={{
                  fontSize: "0.75rem",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "1px solid #a45a38",
                  background: "#fff3e8",
                  color: "#5f351f",
                  cursor: isLoading || isClearing ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {isClearing ? "Clearing..." : "Clear Chat"}
              </button>
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
              disabled={isLoading || isClearing}
              style={{ flex: 1, padding: "10px", border: "1px solid #c9b09a", borderRadius: "10px", background: "#fffdf9", color: "#3d2a1d" }}
            />
            <button 
              onClick={send}
              disabled={isLoading || isClearing}
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