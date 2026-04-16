import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { generateEmbedding, calculateSimilarity, TFIDFSearch } from '@/lib/nlp';

// Global cache for the TF-IDF engine to avoid re-training on every search
let cachedTFIDF: TFIDFSearch | null = null;
let lastCraftCount = 0;

/**
 * Semantic Search API (Hybrid)
 * -------------------
 * This route combines keyword precision (TF-IDF) with concept understanding (AI Embeddings).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    await dbConnect();

    // 1. Fetch crafts
    const allCrafts = await Craft.find({}).sort({ id: 1 }).lean();

    // 2. Refresh the TF-IDF matching engine if the dataset changed
    if (!cachedTFIDF || allCrafts.length !== lastCraftCount) {
      cachedTFIDF = new TFIDFSearch(allCrafts);
      lastCraftCount = allCrafts.length;
    }

    // 3. Vectorize the User Query (Feeling-based match)
    const queryEmbedding = await generateEmbedding(query);

    // 4. Mathematical Ranking (Hybrid)
    const scoredResults = allCrafts.map((craft: any, index: number) => {
      // AI Similarity score (Concept)
      const aiScore = craft.embedding && craft.embedding.length > 0
        ? calculateSimilarity(queryEmbedding, craft.embedding)
        : 0;
      
      // Keyword score (Precision)
      const keywordScore = cachedTFIDF!.getSimilarity(query, index);

      // Hybrid Weighting: 70% Keyword precision, 30% AI Concept matching
      const finalScore = (keywordScore * 0.7) + (aiScore * 0.3);
      
      return { ...craft, similarity: finalScore, aiScore, keywordScore };
    });

    // 5. Rank
    scoredResults.sort((a, b) => b.similarity - a.similarity);

    // 6. Dynamic Thresholding
    // Only return items that are reasonably close to the best match's quality.
    // If the top match is 0.55, we don't want items that are 0.2.
    const topScore = scoredResults.length > 0 ? scoredResults[0].similarity : 0;
    const MINIMUM_ABSOLUTE_SCORE = 0.2; // Don't return complete garbage
    const DYNAMIC_THRESHOLD = topScore * 0.6; // Must be within 60% of the top result's score
    
    const cutoff = Math.max(MINIMUM_ABSOLUTE_SCORE, DYNAMIC_THRESHOLD);

    const filteredResults = scoredResults
      .filter((r) => r.similarity >= cutoff)
      .slice(0, 50);

    return NextResponse.json(filteredResults);
  } catch (error: any) {
    console.error("Semantic search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
