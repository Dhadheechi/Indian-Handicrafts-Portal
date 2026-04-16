import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { crafts } from '@/data/crafts';

export async function GET() {
  try {
    await dbConnect();
    
    // Clear existing data to avoid duplicates dynamically
    await Craft.deleteMany({});
    
    // Insert new data
    const inserted = await Craft.insertMany(crafts);
    
    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      count: inserted.length 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
