import { pipeline } from '@xenova/transformers';

type FeatureExtractorFn = (
  input: string,
  options: { pooling: 'mean'; normalize: boolean }
) => Promise<{ data: Float32Array | number[] }>;

type CraftSearchDoc = {
  name: string;
  state: string;
  summary: string;
};

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for', 'from', 'has', 'have', 'in',
  'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'was', 'were', 'with',
]);

/**
 * NLP Utility Configuration
 * -----------------------
 * We use a Singleton pattern for the Pipeline to avoid re-loading the 80MB model
 * into memory on every API call. This is crucial for maintaining low memory usage.
 * 
 * Model: all-MiniLM-L6-v2
 * Task: feature-extraction (generates numerical embeddings)
 */
class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: unknown = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

/**
 * Generates a 384-dimensional embedding for a given text string.
 * @param text The input string (e.g., craft metadata)
 * @returns An array of numbers representing the semantic vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = (await PipelineSingleton.getInstance()) as FeatureExtractorFn;
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  
  // Convert the Tensor output to a standard JS number array
  return Array.from(output.data);
}

/**
 * Calculates similarity between two vectors.
 * Since our vectors are normalized by the extractor, the Dot Product
 * is mathematically identical to Cosine Similarity.
 */
export function calculateSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function splitSentences(text: string): string[] {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function tokenizeSentence(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}...`;
}

/**
 * Builds a concise summary from long history text using local extractive NLP.
 * The algorithm ranks sentences with TF-IDF-like weighting and returns top lines
 * in original order for readability.
 */
export function generateSummaryFromHistory(history: string): string {
  const cleaned = cleanText(history);
  if (!cleaned) return '';

  const sentences = splitSentences(cleaned);
  if (sentences.length <= 2) {
    return truncateWords(cleaned, 65);
  }

  const sentenceTokens = sentences.map((sentence) => tokenizeSentence(sentence));
  const df: Record<string, number> = {};

  sentenceTokens.forEach((tokens) => {
    const seen = new Set(tokens);
    seen.forEach((token) => {
      df[token] = (df[token] || 0) + 1;
    });
  });

  const scores = sentenceTokens.map((tokens, index) => {
    if (tokens.length === 0) {
      return { index, score: 0 };
    }

    const tf: Record<string, number> = {};
    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });

    let score = 0;
    Object.keys(tf).forEach((token) => {
      const termFrequency = tf[token] / tokens.length;
      const inverseFrequency = Math.log((sentences.length + 1) / ((df[token] || 0) + 1)) + 1;
      score += termFrequency * inverseFrequency;
    });

    return { index, score };
  });

  const rankedIndexes = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((entry) => entry.index)
    .sort((a, b) => a - b);

  const summary = rankedIndexes.map((idx) => sentences[idx]).join(' ');
  return truncateWords(cleanText(summary), 75);
}

/**
 * TF-IDF Search Engine
 * -------------------
 * This class "trains" on the provided craft descriptions to learn which 
 * words are most descriptive (rare and meaningful) versus common.
 */
export class TFIDFSearch {
  private idf: Record<string, number> = {};
  private docVectors: Record<string, number>[] = [];
  private nDocs: number = 0;

  constructor(crafts: CraftSearchDoc[]) {
    this.nDocs = crafts.length;
    const df: Record<string, number> = {};

    // 1. Tokenize and calculate Document Frequency (DF)
    const docTokens = crafts.map((craft) => {
      // We weight the Name and State higher because they are standard "lyrics"
      const content = `${craft.name} ${craft.name} ${craft.state} ${craft.summary}`;
      const tokens = this.tokenize(content);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((token) => {
        df[token] = (df[token] || 0) + 1;
      });
      return tokens;
    });

    // 2. Calculate IDF
    Object.keys(df).forEach((term) => {
      this.idf[term] = Math.log(this.nDocs / df[term]);
    });

    // 3. Build sparse TF-IDF vectors for each document
    this.docVectors = docTokens.map((tokens) => {
      const tf: Record<string, number> = {};
      tokens.forEach((token) => {
        tf[token] = (tf[token] || 0) + 1;
      });

      const vector: Record<string, number> = {};
      Object.keys(tf).forEach((token) => {
        vector[token] = tf[token] * (this.idf[token] || 0);
      });
      return vector;
    });
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1);
  }

  public getSimilarity(query: string, docIndex: number): number {
    const qTokens = this.tokenize(query);
    const qTf: Record<string, number> = {};
    qTokens.forEach((token) => { qTf[token] = (qTf[token] || 0) + 1; });

    const qVector: Record<string, number> = {};
    Object.keys(qTf).forEach((token) => {
      qVector[token] = qTf[token] * (this.idf[token] || 0);
    });

    const docVector = this.docVectors[docIndex];
    if (!docVector) return 0;

    // Dot product of sparse vectors
    let dotProduct = 0;
    Object.keys(qVector).forEach((token) => {
      if (docVector[token]) {
        dotProduct += qVector[token] * docVector[token];
      }
    });

    // Magnitude for normalization (Cosine Similarity)
    const qMag = Math.sqrt(Object.values(qVector).reduce((sum, v) => sum + v * v, 0));
    const dMag = Math.sqrt(Object.values(docVector).reduce((sum, v) => sum + v * v, 0));

    if (qMag === 0 || dMag === 0) return 0;
    return dotProduct / (qMag * dMag);
  }
}

type FilterDimension = 'category' | 'material' | 'technique';

type TaggableCraft = {
  category: string;
  material: string;
  technique: string;
};

type DynamicTagMaps = {
  category: Record<string, string>;
  material: Record<string, string>;
  technique: Record<string, string>;
};

type FixedFilterBuckets = {
  category: string[];
  material: string[];
  technique: string[];
};

export const DEFAULT_FIXED_FILTER_BUCKETS: FixedFilterBuckets = {
  category: [
    'Art & Paintings',
    'Fragrances & Wellness',
    'Leather & Fibres',
    'Metal & Minerals',
    'Miscellaneous',
    'Pottery & Clay',
    'Stone & Marble',
    'Textiles & Weaving',
    'Wood & Decors',
  ],
  material: [
    'Animal Hide',
    'Earth & Clay',
    'Glass & Crystal',
    'Metal Alloy',
    'Natural Stone',
    'Natural Wood',
    'Paper Pulp',
    'Textile Fiber',
    'Traditional Mix',
  ],
  technique: [
    'Hot Working',
    'Loom & Weft',
    'Molding & Casting',
    'Needlework',
    'Printing & Dyeing',
    'Subtractive Art',
    'Surface Art',
    'Traditional Craft',
  ],
};

const LIGHT_NLP_STOPWORDS = new Set([
  'and', 'or', 'the', 'of', 'with', 'for', 'work', 'craft', 'traditional', 'based', 'hand', 'made',
]);

const SYNONYM_NORMALIZATION: Record<string, string> = {
  agate: 'stone',
  marble: 'stone',
  stone: 'stone',
  mineral: 'mineral',
  minerals: 'mineral',
  clay: 'clay',
  pottery: 'pottery',
  oil: 'fragrance',
  soap: 'wellness',
  perfume: 'fragrance',
  incense: 'fragrance',
  jasmine: 'fragrance',
  flower: 'fragrance',
  mask: 'wood',
  masks: 'wood',
  doll: 'wood',
  leather: 'leather',
  coir: 'textile',
  yarn: 'textile',
  shawl: 'textile',
  wool: 'textile',
  mat: 'textile',
  turban: 'textile',
  jute: 'textile',
  tie: 'dye',
  dye: 'dye',
  print: 'print',
  block: 'print',
  stitch: 'stitch',
  stitching: 'stitch',
  carve: 'carve',
  carving: 'carve',
  cast: 'cast',
  casting: 'cast',
  mold: 'mold',
  molding: 'mold',
  blow: 'blow',
  blowing: 'blow',
  paint: 'paint',
  painting: 'paint',
  handpainting: 'paint',
  handi: 'craft',
  handicraft: 'craft',
  textile: 'textile',
  textiles: 'textile',
  fabric: 'textile',
  fabrics: 'textile',
  weaving: 'weave',
  woven: 'weave',
  printed: 'print',
  printing: 'print',
  dyed: 'dye',
  dyeing: 'dye',
  wood: 'wood',
  wooden: 'wood',
  carved: 'carve',
  metal: 'metal',
  metallic: 'metal',
  paper: 'paper',
  paintings: 'paint',
  fragrance: 'fragrance',
  fragrances: 'fragrance',
  wellness: 'wellness',
};

const BUCKET_PROTOTYPES: Record<FilterDimension, Record<string, string[]>> = {
  category: {
    'Art & Paintings': ['art', 'paint', 'painting', 'paper', 'mache'],
    'Fragrances & Wellness': ['fragrance', 'perfume', 'incense', 'flower', 'oil', 'soap', 'aroma'],
    'Leather & Fibres': ['leather', 'fiber', 'fibre'],
    'Metal & Minerals': ['metal', 'mineral', 'alloy', 'grinder', 'processed'],
    Miscellaneous: ['misc', 'other', 'craft', 'general', 'handicraft'],
    'Pottery & Clay': ['pottery', 'clay', 'ceramic', 'terracotta'],
    'Stone & Marble': ['stone', 'marble', 'agate', 'rock'],
    'Textiles & Weaving': ['textile', 'fabric', 'weave', 'shawl', 'wool', 'coir', 'jute', 'dye', 'print'],
    'Wood & Decors': ['wood', 'wooden', 'carve', 'doll', 'mask', 'decor'],
  },
  material: {
    'Animal Hide': ['animal', 'hide', 'leather', 'skin'],
    'Earth & Clay': ['earth', 'clay', 'mud', 'terracotta'],
    'Glass & Crystal': ['glass', 'crystal'],
    'Metal Alloy': ['metal', 'alloy', 'brass', 'iron', 'steel'],
    'Natural Stone': ['stone', 'rock', 'marble', 'granite', 'agate'],
    'Natural Wood': ['wood', 'timber', 'bamboo'],
    'Paper Pulp': ['paper', 'pulp', 'mache'],
    'Textile Fiber': ['textile', 'fabric', 'fiber', 'fibre', 'cloth', 'cotton', 'silk', 'wool'],
    'Traditional Mix': ['traditional', 'mixed', 'blend'],
  },
  technique: {
    'Hot Working': ['hot', 'blow', 'blowing', 'furnace', 'heat'],
    'Loom & Weft': ['loom', 'weft', 'warp', 'weave', 'weaving'],
    'Molding & Casting': ['mold', 'molding', 'cast', 'casting'],
    Needlework: ['needle', 'stitch', 'stitching', 'sew', 'embroidery'],
    'Printing & Dyeing': ['print', 'printing', 'block', 'dye', 'dyeing'],
    'Subtractive Art': ['carve', 'carving', 'chiseling', 'cut'],
    'Surface Art': ['surface', 'paint', 'painting', 'handpaint'],
    'Traditional Craft': ['traditional', 'heritage', 'classic'],
  },
};

function normalizeTagText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenizeTag(value: string): string[] {
  const normalized = normalizeTagText(value);
  if (!normalized) return [];

  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !LIGHT_NLP_STOPWORDS.has(token))
    .map((token) => SYNONYM_NORMALIZATION[token] || token);
}

function jaccardSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection += 1;
  });

  const union = tokensA.size + tokensB.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
}

function bigramDiceSimilarity(a: string, b: string): number {
  const toBigrams = (value: string): string[] => {
    const cleaned = normalizeTagText(value).replace(/\s+/g, '');
    if (cleaned.length < 2) return cleaned ? [cleaned] : [];
    const grams: string[] = [];
    for (let i = 0; i < cleaned.length - 1; i++) {
      grams.push(cleaned.slice(i, i + 2));
    }
    return grams;
  };

  const aBigrams = toBigrams(a);
  const bBigrams = toBigrams(b);
  if (aBigrams.length === 0 || bBigrams.length === 0) return 0;

  const bCount = new Map<string, number>();
  bBigrams.forEach((g) => bCount.set(g, (bCount.get(g) || 0) + 1));

  let overlap = 0;
  aBigrams.forEach((g) => {
    const count = bCount.get(g) || 0;
    if (count > 0) {
      overlap += 1;
      bCount.set(g, count - 1);
    }
  });

  return (2 * overlap) / (aBigrams.length + bBigrams.length);
}

function getPrototypeTokens(dimension: FilterDimension, bucket: string): Set<string> {
  const labelTokens = tokenizeTag(bucket);
  const seedTokens = (BUCKET_PROTOTYPES[dimension][bucket] || []).map(
    (token) => SYNONYM_NORMALIZATION[token] || token
  );
  return new Set([...labelTokens, ...seedTokens]);
}

function classifyValueToBucket(
  value: string,
  dimension: FilterDimension,
  buckets: string[]
): { bucket: string; score: number } {
  const valueTokens = new Set(tokenizeTag(value));
  const valueTokenCount = Math.max(valueTokens.size, 1);
  let bestBucket = buckets[0] || value;
  let bestScore = -1;

  for (const bucket of buckets) {
    const prototypeTokens = getPrototypeTokens(dimension, bucket);
    let overlap = 0;
    valueTokens.forEach((token) => {
      if (prototypeTokens.has(token)) overlap += 1;
    });

    const jaccard = jaccardSimilarity(valueTokens, prototypeTokens);
    const coverage = overlap / valueTokenCount;
    const lexical = bigramDiceSimilarity(value, bucket);

    const score = (coverage * 0.65) + (jaccard * 0.25) + (lexical * 0.1);

    if (score > bestScore) {
      bestScore = score;
      bestBucket = bucket;
    }
  }

  return { bucket: bestBucket, score: Math.max(0, Math.min(1, bestScore)) };
}

function buildDimensionMap(
  values: string[],
  dimension: FilterDimension,
  buckets: string[]
): Record<string, string> {
  const uniqueValues = Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const map: Record<string, string> = {};

  uniqueValues.forEach((value) => {
    const result = classifyValueToBucket(value, dimension, buckets);
    map[value] = result.bucket;
  });

  return map;
}

export async function buildDynamicTagMaps(
  crafts: TaggableCraft[],
  fixedBuckets: FixedFilterBuckets = DEFAULT_FIXED_FILTER_BUCKETS
): Promise<DynamicTagMaps> {
  const categories = crafts.map((craft) => craft.category);
  const materials = crafts.map((craft) => craft.material);
  const techniques = crafts.map((craft) => craft.technique);

  return {
    category: buildDimensionMap(categories, 'category', fixedBuckets.category),
    material: buildDimensionMap(materials, 'material', fixedBuckets.material),
    technique: buildDimensionMap(techniques, 'technique', fixedBuckets.technique),
  };
}
