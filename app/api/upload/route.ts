import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Clean unique filename
    const ext = path.extname(file.name) || '.png';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${cleanName}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext.toLowerCase());
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    return NextResponse.json({
      url: `/uploads/${filename}`,
      name: file.name,
      type: isVideo ? 'video' : 'image',
      size: sizeInMB
    });
  } catch (err) {
    console.error('Upload API Error:', err);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}