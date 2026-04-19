import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { buildDynamicTagMaps, DEFAULT_FIXED_FILTER_BUCKETS } from '@/lib/nlp';
import { ensureCraftDataSeeded } from '@/lib/seed';

type RawCraft = {
  id: number;
  state: string;
  category: string;
  material: string;
  technique: string;
};

type DynamicFiltersPayload = {
  states: string[];
  filters: {
    category: string[];
    material: string[];
    technique: string[];
  };
  maps: {
    category: Record<string, string>;
    material: Record<string, string>;
    technique: Record<string, string>;
  };
};

const globalFilterCache = globalThis as typeof globalThis & {
  __dynamicFilterCache?: {
    signature: string;
    payload: DynamicFiltersPayload;
  };
};

function buildSignature(crafts: RawCraft[]): string {
  let hash = 0;
  for (const craft of crafts) {
    const row = `${craft.state}|${craft.category}|${craft.material}|${craft.technique}`;
    for (let i = 0; i < row.length; i++) {
      hash = (hash * 31 + row.charCodeAt(i)) | 0;
    }
  }
  return `${crafts.length}:${hash}`;
}

export async function GET() {
  try {
    await dbConnect();
    await ensureCraftDataSeeded();

    const crafts = await Craft.find({}).sort({ id: 1 }).lean<RawCraft[]>();
    const signature = buildSignature(crafts);

    if (globalFilterCache.__dynamicFilterCache?.signature === signature) {
      return NextResponse.json(globalFilterCache.__dynamicFilterCache.payload);
    }

    const maps = await buildDynamicTagMaps(crafts, DEFAULT_FIXED_FILTER_BUCKETS);

    const states = ['All', ...Array.from(new Set(crafts.map((craft) => craft.state).filter(Boolean))).sort()];
    const category = ['All', ...DEFAULT_FIXED_FILTER_BUCKETS.category];
    const material = ['All', ...DEFAULT_FIXED_FILTER_BUCKETS.material];
    const technique = ['All', ...DEFAULT_FIXED_FILTER_BUCKETS.technique];

    const payload: DynamicFiltersPayload = {
      states,
      filters: { category, material, technique },
      maps,
    };

    globalFilterCache.__dynamicFilterCache = { signature, payload };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to build dynamic filters';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
