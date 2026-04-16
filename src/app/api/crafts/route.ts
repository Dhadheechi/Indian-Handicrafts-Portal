import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';

export async function GET() {
  try {
    await dbConnect();
    const crafts = await Craft.find({}).sort({ id: 1 }).lean();
    return NextResponse.json(crafts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
