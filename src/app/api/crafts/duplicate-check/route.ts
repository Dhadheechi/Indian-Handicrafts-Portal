import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { generateEmbedding, calculateSimilarity } from '@/lib/nlp';

export async function POST(req: Request) {
  try {
    const { name, state, category, material, technique, summary } = await req.json();
    
    // 1. Construct the semantic text for comparison
    const semanticText = `${name}. ${category} made of ${material} using ${technique}. ${summary}`;
    
    // 2. Generate embedding for the new craft
    const newEmbedding = await generateEmbedding(semanticText);
    
    await dbConnect();
    
    // 3. Fetch all existing crafts to compare
    // Note: We could filter by state for performance, but user might want global check.
    // Given the small dataset, we'll check all.
    const allCrafts = await Craft.find({}, { name: 1, embedding: 1, state: 1 }).lean();
    
    let maxSimilarity = 0;
    let mostSimilarCraft = null;

    // 4. Find the most similar craft
    for (const existing of allCrafts) {
      if (existing.embedding && existing.embedding.length > 0) {
        const similarity = calculateSimilarity(newEmbedding, existing.embedding);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mostSimilarCraft = existing;
        }
      }
    }

    return NextResponse.json({
      similarity: maxSimilarity,
      match: mostSimilarCraft ? {
        name: mostSimilarCraft.name,
        state: mostSimilarCraft.state
      } : null
    });

  } catch (error: any) {
    console.error("Duplicate check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
