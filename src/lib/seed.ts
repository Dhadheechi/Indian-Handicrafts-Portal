import Craft from "@/lib/models/Craft";
import dbConnect from "@/lib/mongoose";
import { generateEmbedding, generateSummaryFromHistory } from "@/lib/nlp";
import { crafts } from "@/data/crafts";

type SeedOptions = {
  force?: boolean;
};

type SeedResult = {
  insertedCount: number;
  skipped: boolean;
};

type SeedGlobalCache = typeof globalThis & {
  __craftSeedPromise?: Promise<SeedResult>;
};

const globalSeedCache = globalThis as SeedGlobalCache;

function normalizeForComparison(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

async function runSeed({ force = false }: SeedOptions = {}): Promise<SeedResult> {
  await dbConnect();

  const existingCount = await Craft.countDocuments({});
  if (!force && existingCount > 0) {
    return { insertedCount: 0, skipped: true };
  }

  if (force) {
    await Craft.deleteMany({});
  }

  console.log(`Seeding started. Generating embeddings for ${crafts.length} crafts...`);

  const craftsWithEmbeddings = [];
  for (const craft of crafts) {
    const historyText = (craft.history || "").trim();
    const existingSummary = (craft.summary || "").trim();
    const shouldRegenerateSummary =
      historyText.length > 0 &&
      (!existingSummary || normalizeForComparison(existingSummary) === normalizeForComparison(historyText));

    const summary = shouldRegenerateSummary
      ? generateSummaryFromHistory(historyText)
      : existingSummary;

    const semanticText = `${craft.name}. ${craft.category} made of ${craft.material} using ${craft.technique}. ${summary}`;
    const embedding = await generateEmbedding(semanticText);

    craftsWithEmbeddings.push({
      ...craft,
      summary,
      embedding,
    });
  }

  const inserted = await Craft.insertMany(craftsWithEmbeddings);
  return { insertedCount: inserted.length, skipped: false };
}

export async function ensureCraftDataSeeded(): Promise<SeedResult> {
  if (!globalSeedCache.__craftSeedPromise) {
    globalSeedCache.__craftSeedPromise = runSeed({ force: false }).catch((error) => {
      globalSeedCache.__craftSeedPromise = undefined;
      throw error;
    });
  }

  return globalSeedCache.__craftSeedPromise;
}

export async function forceReseedCraftData(): Promise<SeedResult> {
  const result = await runSeed({ force: true });
  globalSeedCache.__craftSeedPromise = Promise.resolve(result);
  return result;
}
