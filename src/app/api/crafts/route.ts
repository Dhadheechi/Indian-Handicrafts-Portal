import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { ensureCraftDataSeeded } from '@/lib/seed';

export async function GET() {
  try {
    await dbConnect();
    await ensureCraftDataSeeded();
    const crafts = await Craft.find({}).sort({ id: 1 }).lean();
    return NextResponse.json(crafts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // Find the latest ID to increment
    const lastCraft = await Craft.findOne().sort({ id: -1 });
    const nextId = lastCraft ? lastCraft.id + 1 : 1;

    const newCraft = new Craft({
      ...data,
      id: nextId,
    });

    await newCraft.save();
    return NextResponse.json(newCraft, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
