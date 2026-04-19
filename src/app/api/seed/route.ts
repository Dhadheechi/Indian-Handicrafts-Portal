import { NextResponse } from 'next/server';
import { forceReseedCraftData } from '@/lib/seed';

export async function GET() {
  try {
    const result = await forceReseedCraftData();
    
    return NextResponse.json({ 
      message: 'Database seeded with embeddings successfully', 
      count: result.insertedCount 
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
