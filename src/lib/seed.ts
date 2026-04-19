import Craft from "@/lib/models/Craft";
import dbConnect from "@/lib/mongoose";
import { generateEmbedding } from "@/lib/nlp";
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
    const semanticText = `${craft.name}. ${craft.category} made of ${craft.material} using ${craft.technique}. ${craft.summary}`;
    const embedding = await generateEmbedding(semanticText);
    craftsWithEmbeddings.push({
      ...craft,
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
