import mongoose, { Document, Schema } from "mongoose";

type GIPreference = "any" | "gi" | "non-gi";

type AppliedFilters = {
  states: string[];
  categories: string[];
  materials: string[];
  techniques: string[];
  giPreference: GIPreference;
};

export type ChatSource = {
  id: number;
  name: string;
  state: string;
  category: string;
  gi: boolean;
};

export type PersistedChatMessage = {
  role: "assistant" | "user";
  text: string;
  sources?: ChatSource[];
};

export interface IChatSession extends Document {
  conversationId: string;
  messages: PersistedChatMessage[];
  lastAppliedFilters: AppliedFilters | null;
  updatedAt: Date;
  createdAt: Date;
}

const ChatSourceSchema = new Schema<ChatSource>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    category: { type: String, required: true },
    gi: { type: Boolean, required: true },
  },
  { _id: false }
);

const PersistedChatMessageSchema = new Schema<PersistedChatMessage>(
  {
    role: { type: String, enum: ["assistant", "user"], required: true },
    text: { type: String, required: true },
    sources: { type: [ChatSourceSchema], default: undefined },
  },
  { _id: false }
);

const AppliedFiltersSchema = new Schema<AppliedFilters>(
  {
    states: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    techniques: { type: [String], default: [] },
    giPreference: { type: String, enum: ["any", "gi", "non-gi"], default: "any" },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    messages: { type: [PersistedChatMessageSchema], default: [] },
    lastAppliedFilters: { type: AppliedFiltersSchema, default: null },
  },
  {
    timestamps: true,
  }
);

ChatSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
