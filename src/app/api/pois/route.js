import { POI } from '@/lib/models';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get('modelId');
  
  if (!modelId) {
    return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
  }

  const pois = await POI.find({ modelId });
  return NextResponse.json(pois);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const poi = await POI.create(body);
  return NextResponse.json(poi, { status: 201 });
}

export async function PUT(request) {
  await dbConnect();
  const body = await request.json();
  const { _id, ...updateData } = body;
  const updatedPOI = await POI.findByIdAndUpdate(_id, updateData, { new: true });
  return NextResponse.json(updatedPOI);
}

export async function DELETE(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await POI.findByIdAndDelete(id);
  return NextResponse.json({ message: 'POI deleted successfully' });
}