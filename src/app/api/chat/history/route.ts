import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import ChatSession, { PersistedChatMessage } from "@/lib/models/ChatSession";

type GIPreference = "any" | "gi" | "non-gi";

type AppliedFilters = {
  states: string[];
  categories: string[];
  materials: string[];
  techniques: string[];
  giPreference: GIPreference;
};

type HistoryPayload = {
  conversationId?: string;
  messages?: PersistedChatMessage[];
  lastAppliedFilters?: AppliedFilters | null;
};

function createConversationId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeMessages(messages: unknown): PersistedChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => {
      if (!message || typeof message !== "object") return false;
      const role = (message as { role?: unknown }).role;
      const text = (message as { text?: unknown }).text;
      return (role === "assistant" || role === "user") && typeof text === "string";
    })
    .map((message) => {
      const safe = message as PersistedChatMessage;
      return {
        role: safe.role,
        text: safe.text,
        sources: Array.isArray(safe.sources)
          ? safe.sources.map((source) => ({
              id: Number(source.id),
              name: String(source.name || ""),
              state: String(source.state || ""),
              category: String(source.category || ""),
              gi: Boolean(source.gi),
            }))
          : undefined,
      };
    })
    .slice(-24);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedId = (url.searchParams.get("conversationId") || "").trim();
    const conversationId = requestedId || createConversationId();

    await dbConnect();

    const session = await ChatSession.findOne({ conversationId }).lean<{
      conversationId: string;
      messages: PersistedChatMessage[];
      lastAppliedFilters: AppliedFilters | null;
    }>();

    return NextResponse.json({
      conversationId,
      messages: session?.messages || [],
      lastAppliedFilters: session?.lastAppliedFilters || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HistoryPayload;
    const conversationId = (body.conversationId || "").trim() || createConversationId();
    const messages = sanitizeMessages(body.messages);
    const lastAppliedFilters = body.lastAppliedFilters || null;

    await dbConnect();

    await ChatSession.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          conversationId,
          messages,
          lastAppliedFilters,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, conversationId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const conversationId = (url.searchParams.get("conversationId") || "").trim();

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    await dbConnect();
    await ChatSession.deleteOne({ conversationId });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
