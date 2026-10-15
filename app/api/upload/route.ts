import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { r2Enabled, uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Limit upload to 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum 50MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${cleanName}${ext}`;

    const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext.toLowerCase());
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // 1. Production Mode: Upload to Cloudflare R2 if configured
    if (r2Enabled) {
      try {
        const publicUrl = await uploadToR2({
          fileBuffer: buffer,
          filename,
          contentType: file.type || (isVideo ? 'video/mp4' : 'image/png'),
        });

        return NextResponse.json({
          url: publicUrl,
          name: file.name,
          type: isVideo ? 'video' : 'image',
          size: sizeInMB,
          storage: 'r2',
        });
      } catch (r2Error) {
        console.error('Cloudflare R2 upload failed, checking local fallback:', r2Error);
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: r2Error instanceof Error ? r2Error.message : 'Cloudflare R2 upload error' },
            { status: 500 }
          );
        }
      }
    }

    // 2. Development / Fallback Mode: Write to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      name: file.name,
      type: isVideo ? 'video' : 'image',
      size: sizeInMB,
      storage: 'local',
    });
  } catch (err) {
    console.error('Upload API Error:', err);
    return NextResponse.json({ error: 'Failed to process media upload' }, { status: 500 });
  }
}