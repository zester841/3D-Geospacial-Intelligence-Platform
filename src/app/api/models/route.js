import { Model } from '@/lib/models';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const models = await Model.find({}).lean(); // .lean() converts to plain JS objects
    
    // Always return a valid JSON array (empty if no models)
    return NextResponse.json(models || []);
  } catch (error) {
    console.error('Database error:', error);
    // Return empty array on error
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    const models = await Model.find({}).lean(); // .lean() converts to plain JS objects
    
    // Always return a valid JSON array (empty if no models)
    return NextResponse.json(models || []);
  } catch (error) {
    console.error('Database error:', error);
    // Return empty array on error
    return NextResponse.json([], { status: 500 });
  }
}