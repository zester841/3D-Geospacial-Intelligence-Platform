import { NextResponse } from 'next/server';
import { Model } from '@/lib/models';
import dbConnect from '@/lib/dbConnect';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  await dbConnect();
  
  const formData = await request.formData();
  console.log("formData at upload", formData);
  const file = formData.get('file');
  const name = formData.get('name');
  const category = formData.get('category');
  const tags = formData.get('tags') ? formData.get('tags').split(',') : [];
  
  if (!file || !name) {
    return NextResponse.json({ error: 'File and name are required' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'models');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  const model = await Model.create({
    name,
    filename,
    path: `/models/${filename}`,
    category,
    tags: tags.map(tag => tag.trim()).filter(tag => tag)
  });
  return NextResponse.json(model, { status: 201 });
}