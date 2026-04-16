import mongoose, { Schema, Document } from "mongoose";

export interface ICraft extends Document {
  id: number;
  name: string;
  state: string;
  district: string;
  category: string;
  material: string;
  technique: string;
  gi: boolean;
  artisan: string;
  language: string[];
  summary: string;
  history: string;
  authenticity: string;
  image: string;
  embedding: number[];
}

const CraftSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String },
  category: { type: String },
  material: { type: String },
  technique: { type: String },
  gi: { type: Boolean },
  artisan: { type: String },
  language: { type: [String] },
  summary: { type: String },
  history: { type: String },
  authenticity: { type: String },
  image: { type: String },
  embedding: { type: [Number], default: [] },
});

export default mongoose.models.Craft || mongoose.model<ICraft>("Craft", CraftSchema);
