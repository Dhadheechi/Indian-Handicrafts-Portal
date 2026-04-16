import { pipeline, Pipeline } from '@xenova/transformers';

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

  constructor(crafts: any[]) {
    this.nDocs = crafts.length;
    const df: Record<string, number> = {};

    // 1. Tokenize and calculate Document Frequency (DF)
    const docTokens = crafts.map(c => {
      // We weight the Name and State higher because they are standard "lyrics"
      const content = `${c.name} ${c.name} ${c.state} ${c.summary}`;
      const tokens = this.tokenize(content);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(t => {
        df[t] = (df[t] || 0) + 1;
      });
      return tokens;
    });

    // 2. Calculate IDF
    Object.keys(df).forEach(term => {
      this.idf[term] = Math.log(this.nDocs / df[term]);
    });

    // 3. Build sparse TF-IDF vectors for each document
    this.docVectors = docTokens.map(tokens => {
      const tf: Record<string, number> = {};
      tokens.forEach(t => {
        tf[t] = (tf[t] || 0) + 1;
      });

      const vector: Record<string, number> = {};
      Object.keys(tf).forEach(t => {
        vector[t] = tf[t] * (this.idf[t] || 0);
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
    qTokens.forEach(t => { qTf[t] = (qTf[t] || 0) + 1; });

    const qVector: Record<string, number> = {};
    Object.keys(qTf).forEach(t => {
      qVector[t] = qTf[t] * (this.idf[t] || 0);
    });

    const docVector = this.docVectors[docIndex];
    if (!docVector) return 0;

    // Dot product of sparse vectors
    let dotProduct = 0;
    Object.keys(qVector).forEach(t => {
      if (docVector[t]) {
        dotProduct += qVector[t] * docVector[t];
      }
    });

    // Magnitude for normalization (Cosine Similarity)
    const qMag = Math.sqrt(Object.values(qVector).reduce((sum, v) => sum + v * v, 0));
    const dMag = Math.sqrt(Object.values(docVector).reduce((sum, v) => sum + v * v, 0));

    if (qMag === 0 || dMag === 0) return 0;
    return dotProduct / (qMag * dMag);
  }
}
