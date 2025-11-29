import { Category } from '@/lib/models';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  console.log("catgeoryBody", body);
  const category = await Category.create(body);
  return NextResponse.json(category, { status: 201 });
}

export async function DELETE(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Category deleted successfully' });
}