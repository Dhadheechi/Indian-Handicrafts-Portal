import { pipeline, Pipeline } from '@xenova/transformers';

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
  static instance: Pipeline | null = null;

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
  const extractor = await PipelineSingleton.getInstance();
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
