import { Model } from '@/lib/models';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { NodeIO } from '@gltf-transform/core';

export async function POST(req) {
  await dbConnect();
  const { modelId, pois, newName } = await req.json();

  try {
    // Fetch original model from DB
    const original = await Model.findById(modelId);
    if (!original) throw new Error('Original model not found');
    const originalObj = original.toObject();
    console.log('Original path:', originalObj.path);

    // Prepare file paths and names
    const ext = path.extname(originalObj.path);
    const baseName = path.basename(originalObj.path, ext);
    const version = (originalObj.version || 1) + 1;
    const newFileName = `${baseName}_v${version}${ext}`;
    const newFilePath = path.join('public', 'models', newFileName);
    const inputPath = path.join('public', originalObj.path);

    // Load original GLB file
    const io = new NodeIO(); // No extension needed here unless used
    const doc = await io.read(inputPath); // ✅ Await the read

    const root = doc.getRoot();
    const scene = root.listScenes()[0];

    // Add POI nodes to the scene
    pois.forEach((poi) => {
      const node = doc.createNode(poi.name)
        .setTranslation([poi.position.x, poi.position.y, poi.position.z])
        .setExtras({
          type: poi.type,
          description: poi.description
        });
      scene.addChild(node);
    });

    // Write the updated GLB file
    await io.write(newFilePath, doc); // Optional await, safe for future

    // Save new model info to DB
    const versionedModel = new Model({
      name: newName,
      path: `/models/${newFileName}`,
      version,
      parentId: original._id,
      pois
    });

    await versionedModel.save();

    return NextResponse.json(versionedModel);
  } catch (error) {
    console.error('Error saving GLB with POIs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
