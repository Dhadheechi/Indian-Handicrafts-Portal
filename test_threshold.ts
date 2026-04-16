import mongoose from "mongoose";
import Craft from "./src/lib/models/Craft";
import { generateEmbedding, calculateSimilarity, TFIDFSearch } from "./src/lib/nlp";

const MONGODB_URI = "mongodb://localhost:27017/indian-handicrafts-portal";

async function testQuery(engine: TFIDFSearch, allCrafts: any[], query: string) {
  const queryEmbedding = await generateEmbedding(query);
  const results = allCrafts.map((craft: any, index: number) => {
    const aiScore = craft.embedding && craft.embedding.length > 0
      ? calculateSimilarity(queryEmbedding, craft.embedding)
      : 0;
    const keywordScore = engine.getSimilarity(query, index);
    const finalScore = (keywordScore * 0.7) + (aiScore * 0.3);
    return { name: craft.name, finalScore };
  }).sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);

  console.log(`\nQuery: "${query}"`);
  results.forEach((r, i) => console.log(`${i+1}. ${r.name} (${r.finalScore.toFixed(4)})`));
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const allCrafts = await Craft.find({}).sort({ id: 1 }).lean();
  const engine = new TFIDFSearch(allCrafts);

  await testQuery(engine, allCrafts, "agra carpet");
  await testQuery(engine, allCrafts, "carpet");
  await testQuery(engine, allCrafts, "pottery");
  await testQuery(engine, allCrafts, "blue pottery");
  await testQuery(engine, allCrafts, "wood");

  mongoose.disconnect();
}

run().catch(console.error);
