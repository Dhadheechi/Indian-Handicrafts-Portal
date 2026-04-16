import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { crafts } from '@/data/crafts';
import { generateEmbedding } from '@/lib/nlp';

export async function GET() {
  try {
    await dbConnect();
    
    // Clear existing data
    await Craft.deleteMany({});
    
    // Process each craft to add embeddings
    // We do this in a loop to generate the vector for each one based on its metadata
    const craftsWithEmbeddings = [];
    
    console.log("Seeding started. Generating embeddings for 216 crafts...");

    for (const craft of crafts) {
      // Build a text string that captures the 'essence' of the craft for the NLP model
      const semanticText = `${craft.name}. ${craft.category} made of ${craft.material} using ${craft.technique}. ${craft.summary}`;
      
      const embedding = await generateEmbedding(semanticText);
      
      craftsWithEmbeddings.push({
        ...craft,
        embedding
      });
    }
    
    // Insert new data with vectors
    const inserted = await Craft.insertMany(craftsWithEmbeddings);
    
    return NextResponse.json({ 
      message: 'Database seeded with embeddings successfully', 
      count: inserted.length 
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
